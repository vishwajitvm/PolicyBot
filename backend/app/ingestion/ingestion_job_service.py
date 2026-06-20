from datetime import datetime
from uuid import uuid4

from app.models.ingestion_job import IngestionJob


class IngestionJobService:
    def create(self, source_id: str) -> IngestionJob:
        return IngestionJob(
            job_id=str(uuid4()),
            source_id=source_id,
            source_name=None,
            status="queued",
            phase="queued",
            progress_percent=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
