import logging
from uuid import uuid4

from fastapi import APIRouter

from app.db.mongodb import mongodb
from app.evaluation.eval_service import EvaluationService
from app.schemas.common import ApiResponse
from app.schemas.evaluation import DatasetCreate, EvaluationRunCreate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluation")


@router.post("/datasets", response_model=ApiResponse)
async def create_dataset(payload: DatasetCreate) -> ApiResponse:
    try:
        dataset = {"dataset_id": str(uuid4()), "name": payload.name, "items": payload.items}
        await mongodb.db()["eval_datasets"].insert_one(dataset)
        return ApiResponse(data=dataset, message="Dataset created")
    except Exception as exc:
        logger.exception("Failed to create dataset")
        return ApiResponse(success=False, message=str(exc))


@router.get("/datasets", response_model=ApiResponse)
async def list_datasets() -> ApiResponse:
    try:
        cursor = mongodb.db()["eval_datasets"].find({}, {"_id": 0}).limit(100)
        return ApiResponse(data=[item async for item in cursor], message="Datasets retrieved")
    except Exception as exc:
        logger.exception("Failed to list datasets")
        return ApiResponse(success=False, message=str(exc))


@router.post("/run", response_model=ApiResponse)
async def run_evaluation(payload: EvaluationRunCreate) -> ApiResponse:
    try:
        return ApiResponse(data=await EvaluationService(mongodb.db()).run(payload.dataset_id), message="Evaluation run completed")
    except Exception as exc:
        logger.exception("Failed to run evaluation")
        return ApiResponse(success=False, message=str(exc))


@router.get("/runs", response_model=ApiResponse)
async def list_runs() -> ApiResponse:
    try:
        cursor = mongodb.db()["eval_runs"].find({}, {"_id": 0}).limit(100)
        return ApiResponse(data=[item async for item in cursor], message="Evaluation runs retrieved")
    except Exception as exc:
        logger.exception("Failed to list evaluation runs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/runs/{run_id}", response_model=ApiResponse)
async def get_run(run_id: str) -> ApiResponse:
    try:
        return ApiResponse(data=await mongodb.db()["eval_runs"].find_one({"run_id": run_id}, {"_id": 0}), message="Evaluation run retrieved")
    except Exception as exc:
        logger.exception("Failed to get evaluation run")
        return ApiResponse(success=False, message=str(exc))
