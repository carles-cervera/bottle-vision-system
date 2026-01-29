# app/main.py
import logging
from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.azure_client import predict_level_from_bytes_azure, predict_tap_from_bytes_azure
from app.websocket_manager import manager
from app.pdf_receiver import router as pdf_router
from app.blob_watcher import watch_containers

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Silenciar logs verbosos de librerías externas
logging.getLogger('azure.core.pipeline.policies.http_logging_policy').setLevel(logging.WARNING)
logging.getLogger('azure.storage.blob').setLevel(logging.WARNING)
logging.getLogger('azure').setLevel(logging.WARNING)
logging.getLogger('app.blob_watcher').setLevel(logging.INFO)

# ==== FLAG DE ESTADO DEL SISTEMA (CONTROLADO DESDE EL FRONT) ====
system_running = False
system_running_event = asyncio.Event()  # Evento para parada reactiva
watcher_task = None


def is_system_running() -> bool:
    """
    Devuelve el estado actual del sistema (ON/OFF).
    El watcher la usará para saber si debe procesar blobs.
    """
    return system_running


# ==== LIFESPAN: ARRANCAR EL WATCHER AL INICIAR LA APP ====
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: lanzamos watcher en segundo plano
    global watcher_task, system_running_event
    logger.info("🚀 Iniciando blob_watcher...")
    watcher_task = asyncio.create_task(watch_containers(is_system_running, system_running_event))
    yield
    # SHUTDOWN: cancelar el watcher si está corriendo
    if watcher_task and not watcher_task.done():
        logger.info("🛑 Cancelando blob_watcher...")
        watcher_task.cancel()
        try:
            await watcher_task
        except asyncio.CancelledError:
            pass


app = FastAPI(lifespan=lifespan)
app.include_router(pdf_router)

# Orígenes permitidos (tu front en Vite: 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:8080"
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==== WEBSOCKET PARA TIEMPO REAL ====
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    logger.info(f"✅ Cliente conectado. Total: {len(manager.connections)}")
    try:
        while True:
            await ws.receive_text()
    except Exception as e:
        logger.info(f"❌ Cliente desconectado. Total: {len(manager.connections) - 1}")
        manager.disconnect(ws)


# ==== CONTROL DESDE EL FRONT: ENCENDER / APAGAR SISTEMA ====
@app.post("/system/on")
async def system_on():
    """
    Llamada desde el front para ENCENDER el sistema.
    """
    global system_running, system_running_event, watcher_task
    
    # Si ya está encendido, no hacer nada
    if system_running:
        return {"status": "ON", "message": "Ya estaba encendido"}
    
    system_running = True
    system_running_event.set()
    
    # Reiniciar el watcher para que empiece fresco
    if watcher_task and not watcher_task.done():
        watcher_task.cancel()
        try:
            await watcher_task
        except asyncio.CancelledError:
            pass
    
    # Lanzar nuevo watcher
    watcher_task = asyncio.create_task(watch_containers(is_system_running, system_running_event))
    
    logger.warning("⚡ SISTEMA ENCENDIDO")
    return {"status": "ON"}


@app.post("/system/off")
async def system_off():
    """
    Apaga el sistema de forma inmediata y no bloqueante.
    Idempotente: si ya está apagado, no hace nada.
    """
    global system_running, system_running_event, watcher_task

    logger.warning("📥 /system/off recibido")

    # 🔹 Idempotencia
    if not system_running:
        logger.info("ℹ️ Sistema ya estaba apagado")
        return {
            "status": "OFF",
            "message": "El sistema ya estaba apagado"
        }

    # 🔹 Apagar flags (esto despierta al watcher)
    system_running = False
    system_running_event.clear()

    logger.warning("🛑 APAGANDO SISTEMA...")

    # 🔹 Cancelar watcher SIN esperar (clave para no bloquear)
    if watcher_task and not watcher_task.done():
        watcher_task.cancel()
        logger.warning("📛 Cancelación del watcher solicitada")

    logger.warning("🛑 SISTEMA APAGADO (respuesta inmediata)")

    return {
        "status": "OFF",
        "message": "Sistema apagado correctamente"
    }


# ==== RUTAS PARA ANALIZAR IMÁGENES A DEMANDA DESDE EL FRONT ====
# (Compatibilidad: el front aún llama a /api/analyze/*)

@app.post("/api/analyze/level")
async def analyze_level(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        label, confidence = predict_level_from_bytes_azure(image_bytes)
        return {
            "label": label,
            "confidence": confidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/tap")
async def analyze_tap(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        label, confidence = predict_tap_from_bytes_azure(image_bytes)
        return {
            "label": label,
            "confidence": confidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
