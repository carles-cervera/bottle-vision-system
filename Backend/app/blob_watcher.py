import asyncio
import logging
import os
from typing import Set

from .blob_client import list_blobs
from .processor import process_bottle_from_blobs
from .config import (
    CONTAINER_TAP,
    CONTAINER_LEVEL,
    SYSTEM_POLL_INTERVAL,
)

logger = logging.getLogger(__name__)

processed_blobs: Set[str] = set()


def _get_bottle_id(blob_name: str) -> str:
    name_without_ext = blob_name.rsplit(".", 1)[0]
    if "_tap" in name_without_ext:
        return name_without_ext.replace("_tap", "")
    elif "_level" in name_without_ext:
        return name_without_ext.replace("_level", "")
    return name_without_ext


async def _list_blobs_async(container: str):
    """
    Wrapper async para list_blobs (bloqueante)
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, list_blobs, container)


async def watch_containers(get_system_running_flag, system_running_event: asyncio.Event):
    """
    Watcher robusto:
    - NO bloquea el event loop
    - Cancelable
    - Apagado inmediato
    """
    global processed_blobs

    logger.info("[blob_watcher] 🚀 Iniciado")

    # Inicialización (en executor)
    try:
        tap_blobs, level_blobs = await asyncio.gather(
            _list_blobs_async(CONTAINER_TAP),
            _list_blobs_async(CONTAINER_LEVEL),
        )
        for blob in tap_blobs:
            processed_blobs.add(f"{CONTAINER_TAP}/{blob}")
        for blob in level_blobs:
            processed_blobs.add(f"{CONTAINER_LEVEL}/{blob}")
        logger.info(f"[blob_watcher] ✅ {len(processed_blobs)} blobs iniciales marcados")
    except Exception as e:
        logger.error(f"[blob_watcher] ❌ Error en init: {e}")

    poll_interval = max(
        0.05,
        float(os.getenv("BLOB_POLL_INTERVAL_S", SYSTEM_POLL_INTERVAL)),
    )

    try:
        while True:
            # 🔹 Esperar a que el sistema esté encendido
            await system_running_event.wait()

            if not get_system_running_flag():
                continue

            # 🔹 Listado NO bloqueante
            tap_blobs, level_blobs = await asyncio.gather(
                _list_blobs_async(CONTAINER_TAP),
                _list_blobs_async(CONTAINER_LEVEL),
            )

            bottles_tap = {_get_bottle_id(b): b for b in tap_blobs}
            bottles_level = {_get_bottle_id(b): b for b in level_blobs}

            complete_bottles = sorted(
                set(bottles_tap) & set(bottles_level)
            )

            for bottle_id in complete_bottles:
                if not get_system_running_flag():
                    logger.warning("[blob_watcher] 🛑 Apagado detectado")
                    return

                tap_blob = bottles_tap[bottle_id]
                level_blob = bottles_level[bottle_id]

                tap_id = f"{CONTAINER_TAP}/{tap_blob}"
                level_id = f"{CONTAINER_LEVEL}/{level_blob}"

                if tap_id in processed_blobs and level_id in processed_blobs:
                    continue

                logger.info(f"[blob_watcher] 🧴 Botella nueva: {bottle_id}")

                processed_blobs.add(tap_id)
                processed_blobs.add(level_id)

                await process_bottle_from_blobs(
                    bottle_id, tap_blob, level_blob
                )

            # 🔹 Espera cancelable
            await asyncio.sleep(poll_interval)

    except asyncio.CancelledError:
        logger.warning("[blob_watcher] ✋ Cancelado limpiamente")
        raise
    except Exception as e:
        logger.error(f"[blob_watcher] 💥 Error fatal: {e}")
