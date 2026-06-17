from app.db.repositories.base_repository import BaseRepository


class TraceRepository(BaseRepository):
    collection_name = "query_traces"

    async def get(self, trace_id: str) -> dict | None:
        return await self.find_one({"trace_id": trace_id})
