from fastapi import APIRouter, Request

from app.db.mongodb import mongodb
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.ingestion.ingestion_service import IngestionService
from app.providers.provider_factory import ProviderFactory
from app.schemas.common import ApiResponse
from app.schemas.ingestion import IngestionJobCreate

router = APIRouter(prefix="/ingestion")


@router.post("/jobs", response_model=ApiResponse)
async def create_job(payload: IngestionJobCreate, request: Request) -> ApiResponse:
    settings = request.app.state.settings
    embedding = ProviderFactory(settings).create_embedding()
    service = IngestionService(mongodb.db(), settings, embedding, request.app.state.vector_store)
    job = await service.run_for_source(payload.source_id)
    return ApiResponse(data=job, message="Ingestion job completed")


@router.get("/jobs", response_model=ApiResponse)
async def list_jobs() -> ApiResponse:
    return ApiResponse(data=await IngestionJobRepository(mongodb.db()).find_many())


@router.get("/jobs/{job_id}", response_model=ApiResponse)
async def get_job(job_id: str) -> ApiResponse:
    return ApiResponse(data=await IngestionJobRepository(mongodb.db()).get(job_id))
