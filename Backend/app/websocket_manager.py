import logging
import json
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        try:
            self.connections.remove(ws)
        except ValueError:
            return

    async def broadcast(self, message: dict):
        logger.info(f"📤 [WebSocket] Broadcast a {len(self.connections)} clientes:")
        logger.info(f"   {json.dumps(message, indent=2, ensure_ascii=False)}")

        for ws in list(self.connections):
            try:
                await ws.send_json(message)
            except Exception:
                logger.info("[WebSocket] ❌ Error enviando; desconectando cliente")
                self.disconnect(ws)


manager = WebSocketManager()
