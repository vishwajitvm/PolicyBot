from app.core.time import get_current_time
from tracenest import logger
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Request, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
import json
from bson import ObjectId

from app.db.mongodb import mongodb
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.ingestion.ingestion_service import IngestionService
from app.ingestion.ingestion_job_service import IngestionJobService
from app.providers.provider_factory import ProviderFactory
from app.schemas.common import ApiResponse
from app.schemas.ingestion import IngestionJobCreate
from app.websocket_manager import manager
from app.ingestion.cancellation import cancel_job

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


async def run_ingestion_task(source_id: str, job_id: str, request: Request):
    """Background task to run ingestion for a source."""
    try:
        settings = request.app.state.settings
        embedding = ProviderFactory(settings).create_embedding()
        service = IngestionService(mongodb.db(), settings, embedding, request.app.state.vector_store)
        await service.run_for_source(source_id, job_id=job_id)
    except Exception as exc:
        logger.error(f"Background ingestion task failed for source_id {source_id}")
        # The job should already be updated to failed by the service, but just in case
        job = IngestionJobService().create(source_id).model_dump()
        job.update({
            "status": "failed",
            "errors": [str(exc)],
            "logs": ["Ingestion failed in background task"],
            "created_at": get_current_time(),
            "updated_at": get_current_time(),
        })
        job = _sanitize_for_json(job)
        await IngestionJobRepository(mongodb.db()).insert_one(job)


@router.post("/jobs", response_model=ApiResponse)
async def create_job(payload: IngestionJobCreate, request: Request, background_tasks: BackgroundTasks) -> ApiResponse:
    logger.info(f"Received request to start ingestion job for source_id: {payload.source_id}")
    try:
        # Create the job initially
        job_service = IngestionJobService()
        job = job_service.create(payload.source_id)
        job.source_name = None  # Will be set in the service
        # Insert the job
        await IngestionJobRepository(mongodb.db()).insert_one(job.model_dump())

        # Start the ingestion in the background
        background_tasks.add_task(run_ingestion_task, payload.source_id, job.job_id, request)

        # Return the job immediately
        job = _sanitize_for_json(job.model_dump())
        return ApiResponse(data=job, message="Ingestion job started")
    except Exception as exc:
        logger.error("Failed to create ingestion job for source_id %s", payload.source_id)
        # Create a failed job object
        job = IngestionJobService().create(payload.source_id).model_dump()
        job.update({
            "status": "failed",
            "errors": [str(exc)],
            "logs": ["Ingestion failed to start"],
            "created_at": get_current_time(),
            "updated_at": get_current_time(),
        })
        logger.info("Failed ingestion job dict: %s", job)
        job = _sanitize_for_json(job)
        await IngestionJobRepository(mongodb.db()).insert_one(job)
        return ApiResponse(data=jsonable_encoder(job), message="Ingestion job failed to start")


@router.get("/jobs", response_model=ApiResponse)
async def list_jobs() -> ApiResponse:
    logger.info("Received request to list ingestion jobs")
    try:
        jobs = await IngestionJobRepository(mongodb.db()).find_many()
        jobs = [_sanitize_for_json(j) for j in jobs]
        return ApiResponse(data=jobs, message="Jobs retrieved")
    except Exception as exc:
        logger.error("Failed to list ingestion jobs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/jobs/{job_id}", response_model=ApiResponse)
async def get_job(job_id: str) -> ApiResponse:
    logger.info(f"Received request to get ingestion job: {job_id}")
    try:
        job = await IngestionJobRepository(mongodb.db()).get(job_id)
        if job is None:
            from app.core.exceptions import NotFoundError
            raise NotFoundError(f"Job not found: {job_id}")
        job = _sanitize_for_json(job)
        return ApiResponse(data=job, message="Job retrieved")
    except Exception as exc:
        logger.error("Failed to get job")
        return ApiResponse(success=False, message=str(exc))


@router.post("/jobs/{job_id}/cancel", response_model=ApiResponse)
async def cancel_ingestion_job(job_id: str) -> ApiResponse:
    logger.info(f"Received request to cancel ingestion job: {job_id}")
    try:
        # Attempt to signal the running asyncio background task
        signaled = cancel_job(job_id)
        
        # Also mark the job in the database as cancelled
        job = await IngestionJobRepository(mongodb.db()).get(job_id)
        if job and job.get("status") in ["queued", "running"]:
            job["status"] = "cancelled"
            job["phase"] = "cancelled"
            job["logs"].append("Job manually cancelled by user.")
            job["updated_at"] = get_current_time()
            await IngestionJobRepository(mongodb.db()).upsert_one({"job_id": job_id}, job)
            
            # Broadcast the cancellation to listening WebSockets
            from app.api.v1.ingestion import _sanitize_for_json
            await manager.send_update(job_id, _sanitize_for_json(job))
            
        return ApiResponse(data={"signaled": signaled}, message="Job cancellation requested")
    except Exception as exc:
        logger.error(f"Failed to cancel job: {exc}")
        return ApiResponse(success=False, message=str(exc))


@router.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job updates."""
    logger.info(f"New WebSocket connection requested for job_id: {job_id}")
    await manager.connect(websocket, job_id)
    try:
        # Send the current job state immediately upon connection
        job = await IngestionJobRepository(mongodb.db()).get(job_id)
        if job:
            await websocket.send_text(json.dumps(_sanitize_for_json(job), default=str))
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