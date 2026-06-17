from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.repositories.trace_repository import TraceRepository
from app.observability.log_event import log_event


class TraceService:
    def __init__(self, db: AsyncIOMotorDatabase | None):
        self.repository = TraceRepository(db) if db is not None else None
        self.trace_id = str(uuid4())
        self.events: list[dict] = []

    def record(self, step: str, status: str = "completed", input_summary: dict | None = None, output_summary: dict | None = None, latency_ms: int = 0) -> None:
        self.events.append(log_event(step, status, input_summary, output_summary, latency_ms))

    async def persist(self, payload: dict) -> dict:
        trace = {"trace_id": self.trace_id, "events": self.events, **payload}
        if self.repository is not None:
            await self.repository.upsert_one({"trace_id": self.trace_id}, trace)
        return trace
