from typing import Dict, Set
from fastapi import WebSocket
import json
from tracenest import logger




class ConnectionManager:
    def __init__(self):
        # job_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = set()
        self.active_connections[job_id].add(websocket)
        logger.info(f"WebSocket connected for job_id: {job_id}. Total connections: {len(self.active_connections[job_id])}")

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].discard(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]
            logger.info(f"WebSocket disconnected for job_id: {job_id}")

    async def send_update(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending WebSocket message: {e}")
                    dead_connections.add(connection)
            # Remove dead connections
            for dead in dead_connections:
                self.active_connections[job_id].discard(dead)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def broadcast(self, message: dict):
        """Broadcast to all connections (for system-wide messages)"""
        for job_id in list(self.active_connections.keys()):
            await self.send_update(job_id, message)


manager = ConnectionManager()