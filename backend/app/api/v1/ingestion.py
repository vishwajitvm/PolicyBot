import logging
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Request, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

from app.db.mongodb import mongodb
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.ingestion.ingestion_service import IngestionService
from app.ingestion.ingestion_job_service import IngestionJobService
from app.providers.provider_factory import ProviderFactory
from app.schemas.common import ApiResponse
from app.schemas.ingestion import IngestionJobCreate
from app.websocket_manager import manager

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


async def run_ingestion_task(source_id: str, request: Request):
    """Background task to run ingestion for a source."""
    try:
        settings = request.app.state.settings
        embedding = ProviderFactory(settings).create_embedding()
        service = IngestionService(mongodb.db(), settings, embedding, request.app.state.vector_store)
        await service.run_for_source(source_id)
    except Exception as exc:
        logger.exception("Background ingestion task failed for source_id %s", source_id)
        # The job should already be updated to failed by the service, but just in case
        job = IngestionJobService().create(source_id).model_dump()
        job.update({
            "status": "failed",
            "errors": [str(exc)],
            "logs": ["Ingestion failed in background task"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        job = _sanitize_for_json(job)
        await IngestionJobRepository(mongodb.db()).insert_one(job)


@router.post("/jobs", response_model=ApiResponse)
async def create_job(payload: IngestionJobCreate, request: Request, background_tasks: BackgroundTasks) -> ApiResponse:
    try:
        # Create the job initially
        job_service = IngestionJobService()
        job = job_service.create(payload.source_id)
        job.source_name = None  # Will be set in the service
        # Insert the job
        await IngestionJobRepository(mongodb.db()).insert_one(job.model_dump())

        # Start the ingestion in the background
        background_tasks.add_task(run_ingestion_task, payload.source_id, request)

        # Return the job immediately
        job = _sanitize_for_json(job.model_dump())
        return ApiResponse(data=job, message="Ingestion job started")
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


@router.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job updates."""
    await manager.connect(websocket, job_id)
    try:
        # Send the current job state immediately upon connection
        job = await IngestionJobRepository(mongodb.db()).get(job_id)
        if job:
            await websocket.send_text(json.dumps(_sanitize_for_json(job.model_dump())))
        else:
            # Job not found, send error and close
            await websocket.send_text(json.dumps({
                "error": f"Job {job_id} not found"
            }))
            await websocket.close(code=4004)
            return

        # Keep connection alive and wait for client messages (if any)
        while True:
            # We don't expect messages from client, but we keep the connection open
            # and break on disconnect
            data = await websocket.receive_text()
            # Optionally handle client messages here
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)
        logger.info(f"WebSocket disconnected for job_id: {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job_id {job_id}: {e}")
        manager.disconnect(websocket, job_id)