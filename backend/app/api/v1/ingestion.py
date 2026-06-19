import logging
from datetime import datetime
from fastapi import APIRouter, Request

from app.db.mongodb import mongodb
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.ingestion.ingestion_service import IngestionService
from app.ingestion.ingestion_job_service import IngestionJobService
from app.providers.provider_factory import ProviderFactory
from app.schemas.common import ApiResponse
from app.schemas.ingestion import IngestionJobCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingestion")


@router.post("/jobs", response_model=ApiResponse)
async def create_job(payload: IngestionJobCreate, request: Request) -> ApiResponse:
    try:
        settings = request.app.state.settings
        embedding = ProviderFactory(settings).create_embedding()
        service = IngestionService(mongodb.db(), settings, embedding, request.app.state.vector_store)
        job = await service.run_for_source(payload.source_id)
        return ApiResponse(data=job, message="Ingestion job completed")
    except Exception as exc:
        logger.exception("Failed to create ingestion job for source_id %s", payload.source_id)
        # Create a failed job object
        job = IngestionJobService().create(payload.source_id).model_dump()
        job.update({
            "status": "failed",
            "errors": [str(exc)],
            "logs": ["Ingestion failed to start"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        await IngestionJobRepository(mongodb.db()).insert_one(job)
        return ApiResponse(data=job, message="Ingestion job failed to start")


@router.get("/jobs", response_model=ApiResponse)
async def list_jobs() -> ApiResponse:
    try:
        return ApiResponse(data=await IngestionJobRepository(mongodb.db()).find_many(), message="Jobs retrieved")
    except Exception as exc:
        logger.exception("Failed to list ingestion jobs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/jobs/{job_id}", response_model=ApiResponse)
async def get_job(job_id: str) -> ApiResponse:
    try:
        return ApiResponse(data=await IngestionJobRepository(mongodb.db()).get(job_id), message="Job retrieved")
    except Exception as exc:
        logger.exception("Failed to get ingestion job")
        return ApiResponse(success=False, message=str(exc))
