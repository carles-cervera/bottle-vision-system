import logging
import asyncio
import os
from collections import defaultdict
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

from .blob_client import read_image_bytes, upload_pdf
from .azure_client import (
    predict_tap_from_bytes_azure,
    predict_level_from_bytes_azure
)
from .websocket_manager import manager
from .pdf_generator import generate_error_pdf
from .config import (
    CONTAINER_TAP,
    CONTAINER_LEVEL,
    CONTAINER_ERRORS
)

logger = logging.getLogger(__name__)

# ThreadPoolExecutor para llamadas síncronas a Azure
executor = ThreadPoolExecutor(max_workers=4)

# Contador global
bottle_counter = 0


@dataclass
class BottlePair:
    """Sincronización de imágenes TAP + LEVEL para una botella"""
    tap_bytes: bytes | None = None
    level_bytes: bytes | None = None
    tap_blob_name: str | None = None
    level_blob_name: str | None = None
    first_seen: datetime = field(default_factory=datetime.utcnow)


# Barrier por bottle_id: NO importa el orden de llegada
bottles: dict[str, BottlePair] = {}


def _get_bottle_id(blob_name: str) -> str:
    """
    Extreu l'identificador d'ampolla a partir del nom del fitxer
    Ex: bottle_000013_tap.jpg -> bottle_000013
    Ex: bottle_000013_level.jpg -> bottle_000013
    """
    # Elimina extensió
    name_without_ext = blob_name.rsplit(".", 1)[0]
    # Elimina sufixos _tap o _level
    if "_tap" in name_without_ext:
        return name_without_ext.replace("_tap", "")
    elif "_level" in name_without_ext:
        return name_without_ext.replace("_level", "")
    return name_without_ext


async def process_bottle_parallel(
    bottle_id: str,
    tap_image_bytes: bytes,
    level_image_bytes: bytes
):
    """
    Procesa TAP y LEVEL en PARALELO usando dos endpoints Azure ML separados.
    ⏱️ Reduce tiempo de ~5-6s a ~3s.
    """
    loop = asyncio.get_running_loop()
    
    logger.info(f"[processor] 🚀 {bottle_id} - Procesamiento PARALELO iniciado")
    
    try:
        # Lanzar ambas llamadas a Azure en threads separados con timeout
        tap_task = loop.run_in_executor(
            executor,
            predict_tap_from_bytes_azure,
            tap_image_bytes
        )
        
        level_task = loop.run_in_executor(
            executor,
            predict_level_from_bytes_azure,
            level_image_bytes
        )
        
        # Esperar a ambas con timeout configurable (por defecto 20s)
        timeout_s = float(os.getenv("AZURE_PREDICT_TIMEOUT_S", "20"))
        tap_result, level_result = await asyncio.wait_for(
            asyncio.gather(tap_task, level_task),
            timeout=timeout_s,
        )
        
        # Desempaquetar resultados
        tap_label, tap_confidence = tap_result
        level_label, level_confidence = level_result
        
        logger.info(f"[processor] ✅ {bottle_id} - TAP: {tap_label} ({tap_confidence:.2f}), LEVEL: {level_label} ({level_confidence:.2f})")
        
        return tap_label, tap_confidence, level_label, level_confidence
        
    except asyncio.TimeoutError:
        logger.error(f"[processor] ⏱️ Timeout procesando {bottle_id}")
        # Devolver un resultado para que el sistema siga (se marcará como FAIL)
        return "tap_timeout", 0.0, "level_timeout", 0.0
    except asyncio.CancelledError:
        logger.warning(f"[processor] ⚠️ Cancelado procesamiento paralelo de {bottle_id}")
        raise


async def process_complete_bottle(bottle_id: str, pair: BottlePair):
    """
    Procesa una botella COMPLETA (TAP + LEVEL disponibles).
    Se llama SOLO cuando están las dos imágenes.
    El orden de llegada es IRRELEVANTE.
    """
    global bottle_counter
    
    logger.info(f"[processor] 🔄 {bottle_id} - Botella completa, iniciando análisis")
    
    try:
        # Chequeo de cancelación
        await asyncio.sleep(0)
        
        # 🚀 PROCESAMIENTO PARALELO: TAP + LEVEL simultáneamente
        tap_label, tap_confidence, level_label, level_confidence = await process_bottle_parallel(
            bottle_id,
            pair.tap_bytes,
            pair.level_bytes
        )

        bottle_counter += 1

        status = "PASS"
        if tap_label != "tap_present" or level_label != "ok":
            status = "FAIL"

        # Preparar resultado
        final_result = {
            "bottle_id": bottle_id,
            "timestamp": datetime.utcnow().isoformat(),
            "tap": {
                "label": tap_label,
                "confidence": tap_confidence,
                "image": pair.tap_blob_name
            },
            "level": {
                "label": level_label,
                "confidence": level_confidence,
                "image": pair.level_blob_name
            },
            "status": status,
            "bottles_processed": bottle_counter
        }

        logger.info(f"[processor] 📊 {bottle_id} - {status}")

        # --- Enviar al front via WebSocket ---
        await manager.broadcast({
            "type": "analysis_result",
            "data": final_result
        })

        # --- Si FAIL → generar PDF ---
        if status == "FAIL":
            await asyncio.sleep(0)  # Chequeo de cancelación
            
            pdf_buffer = generate_error_pdf(
                bottle_id=bottle_id,
                tap_result={"label": tap_label, "confidence": tap_confidence},
                level_result={"label": level_label, "confidence": level_confidence},
                tap_image_bytes=pair.tap_bytes,
                level_image_bytes=pair.level_bytes
            )

            pdf_name = f"{bottle_id}_error_report.pdf"
            upload_pdf(filename=pdf_name, pdf_bytes=pdf_buffer.read())

            logger.warning(f"[processor] 📄 {bottle_id} - PDF guardado: {pdf_name}")

        # Limpiar del barrier
        if bottle_id in bottles:
            del bottles[bottle_id]

        return final_result

    except asyncio.CancelledError:
        logger.warning(f"[processor] ⚠️ {bottle_id} - Procesamiento cancelado")
        raise
    except Exception as e:
        logger.error(f"[processor] ❌ {bottle_id} - Error: {e}", exc_info=True)
        raise

async def process_bottle_from_blobs(bottle_id: str, tap_blob_name: str, level_blob_name: str):
    """Procesa una botella completa descargando TAP+LEVEL en paralelo desde Blob.

    Útil para el blob_watcher cuando ya sabe que la botella está completa, para
    evitar la espera/descarga secuencial de TAP y LEVEL.
    """
    loop = asyncio.get_running_loop()

    tap_task = loop.run_in_executor(executor, read_image_bytes, CONTAINER_TAP, tap_blob_name)
    level_task = loop.run_in_executor(executor, read_image_bytes, CONTAINER_LEVEL, level_blob_name)

    tap_bytes, level_bytes = await asyncio.gather(tap_task, level_task)

    pair = BottlePair(
        tap_bytes=tap_bytes,
        level_bytes=level_bytes,
        tap_blob_name=tap_blob_name,
        level_blob_name=level_blob_name,
    )

    return await process_complete_bottle(bottle_id, pair)
