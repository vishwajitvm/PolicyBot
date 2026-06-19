import logging
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

from app.db.mongodb import mongodb
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.ingestion.ingestion_service import IngestionService
from app.ingestion.ingestion_job_service import IngestionJobService
from app.providers.provider_factory import ProviderFactory
from app.schemas.common import ApiResponse
from app.schemas.ingestion import IngestionJobCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingestion")


def _sanitize_for_json(obj):
    """Recursively convert ObjectId to str in dicts/lists."""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_for_json(v) for v in obj]
    else:
        return obj


@router.post("/jobs", response_model=ApiResponse)
async def create_job(payload: IngestionJobCreate, request: Request) -> ApiResponse:
    try:
        settings = request.app.state.settings
        embedding = ProviderFactory(settings).create_embedding()
        service = IngestionService(mongodb.db(), settings, embedding, request.app.state.vector_store)
        job = await service.run_for_source(payload.source_id)
        job = _sanitize_for_json(job)
        return ApiResponse(data=jsonable_encoder(job), message="Ingestion job completed")
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
        logger.info("Failed ingestion job dict: %s", job)
        job = _sanitize_for_json(job)
        await IngestionJobRepository(mongodb.db()).insert_one(job)
        return ApiResponse(data=jsonable_encoder(job), message="Ingestion job failed to start")


@router.get("/jobs", response_model=ApiResponse)
async def list_jobs() -> ApiResponse:
    try:
        jobs = await IngestionJobRepository(mongodb.db()).find_many()
        jobs = [_sanitize_for_json(j) for j in jobs]
        return ApiResponse(data=jobs, message="Jobs retrieved")
    except Exception as exc:
        logger.exception("Failed to list ingestion jobs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/jobs/{job_id}", response_model=ApiResponse)
async def get_job(job_id: str) -> ApiResponse:
    try:
        job = await IngestionJobRepository(mongodb.db()).get(job_id)
        if job is None:
            from app.core.exceptions import NotFoundError
            raise NotFoundError(f"Job not found: {job_id}")
        job = _sanitize_for_json(job)
        return ApiResponse(data=job, message="Job retrieved")
    except Exception as exc:
        logger.exception("Failed to get job")
        return ApiResponse(success=False, message=str(exc))