from app.db.repositories.base_repository import BaseRepository


class SourceRepository(BaseRepository):
    collection_name = "sources"

    async def get(self, source_id: str) -> dict | None:
        return await self.find_one({"source_id": source_id})

    async def list(self) -> list[dict]:
        return await self.find_many()
