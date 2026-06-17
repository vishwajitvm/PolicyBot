from app.db.repositories.base_repository import BaseRepository


class IngestionJobRepository(BaseRepository):
    collection_name = "ingestion_jobs"

    async def get(self, job_id: str) -> dict | None:
        return await self.find_one({"job_id": job_id})
