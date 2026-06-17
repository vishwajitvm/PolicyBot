from app.db.repositories.base_repository import BaseRepository


class DocumentRepository(BaseRepository):
    collection_name = "documents"

    async def find_by_path(self, source_id: str, file_path: str) -> dict | None:
        return await self.find_one({"source_id": source_id, "file_path": file_path})
