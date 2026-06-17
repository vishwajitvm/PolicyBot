from uuid import uuid4

from fastapi import APIRouter

from app.db.mongodb import mongodb
from app.evaluation.eval_service import EvaluationService
from app.schemas.common import ApiResponse
from app.schemas.evaluation import DatasetCreate, EvaluationRunCreate

router = APIRouter(prefix="/evaluation")


@router.post("/datasets", response_model=ApiResponse)
async def create_dataset(payload: DatasetCreate) -> ApiResponse:
    dataset = {"dataset_id": str(uuid4()), "name": payload.name, "items": payload.items}
    await mongodb.db()["eval_datasets"].insert_one(dataset)
    return ApiResponse(data=dataset)


@router.get("/datasets", response_model=ApiResponse)
async def list_datasets() -> ApiResponse:
    cursor = mongodb.db()["eval_datasets"].find({}, {"_id": 0}).limit(100)
    return ApiResponse(data=[item async for item in cursor])


@router.post("/run", response_model=ApiResponse)
async def run_evaluation(payload: EvaluationRunCreate) -> ApiResponse:
    return ApiResponse(data=await EvaluationService(mongodb.db()).run(payload.dataset_id))


@router.get("/runs", response_model=ApiResponse)
async def list_runs() -> ApiResponse:
    cursor = mongodb.db()["eval_runs"].find({}, {"_id": 0}).limit(100)
    return ApiResponse(data=[item async for item in cursor])


@router.get("/runs/{run_id}", response_model=ApiResponse)
async def get_run(run_id: str) -> ApiResponse:
    return ApiResponse(data=await mongodb.db()["eval_runs"].find_one({"run_id": run_id}, {"_id": 0}))
