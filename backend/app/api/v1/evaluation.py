from tracenest import logger
from uuid import uuid4

from fastapi import APIRouter, Request

from app.db.mongodb import mongodb
from app.evaluation.eval_service import EvaluationService
from app.schemas.common import ApiResponse
from app.schemas.evaluation import DatasetCreate, DatasetUpdate, EvaluationRunCreate
from app.providers.provider_factory import ProviderFactory
from app.rag.rag_graph import RAGGraph

router = APIRouter(prefix="/evaluation")

from datetime import datetime, timezone

@router.post("/datasets", response_model=ApiResponse)
async def create_dataset(payload: DatasetCreate) -> ApiResponse:
    try:
        dataset = {
            "dataset_id": str(uuid4()), 
            "name": payload.name, 
            "items": payload.items,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await mongodb.db()["eval_datasets"].insert_one(dataset.copy())
        return ApiResponse(data=dataset, message="Dataset created")
    except Exception as exc:
        logger.error("Failed to create dataset")
        return ApiResponse(success=False, message=str(exc))


@router.put("/datasets/{dataset_id}", response_model=ApiResponse)
async def update_dataset(dataset_id: str, payload: DatasetUpdate) -> ApiResponse:
    try:
        update_data = {"name": payload.name, "items": payload.items}
        result = await mongodb.db()["eval_datasets"].update_one(
            {"dataset_id": dataset_id}, {"$set": update_data}
        )
        if result.matched_count == 0:
            return ApiResponse(success=False, message="Dataset not found")
        return ApiResponse(message="Dataset updated")
    except Exception as exc:
        logger.error("Failed to update dataset")
        return ApiResponse(success=False, message=str(exc))


@router.delete("/datasets/{dataset_id}", response_model=ApiResponse)
async def delete_dataset(dataset_id: str) -> ApiResponse:
    try:
        result = await mongodb.db()["eval_datasets"].delete_one({"dataset_id": dataset_id})
        if result.deleted_count == 0:
            return ApiResponse(success=False, message="Dataset not found")
        # Optionally, delete associated runs
        await mongodb.db()["eval_runs"].delete_many({"dataset_id": dataset_id})
        return ApiResponse(message="Dataset deleted")
    except Exception as exc:
        logger.error("Failed to delete dataset")
        return ApiResponse(success=False, message=str(exc))


@router.get("/datasets", response_model=ApiResponse)
async def list_datasets() -> ApiResponse:
    try:
        cursor = mongodb.db()["eval_datasets"].find({}, {"_id": 0}).sort("created_at", -1).limit(100)
        return ApiResponse(data=[item async for item in cursor], message="Datasets retrieved")
    except Exception as exc:
        logger.error("Failed to list datasets")
        return ApiResponse(success=False, message=str(exc))


@router.post("/run", response_model=ApiResponse)
async def run_evaluation(payload: EvaluationRunCreate, request: Request) -> ApiResponse:
    try:
        settings = request.app.state.settings
        factory = ProviderFactory(settings)
        llm = factory.create_llm()
        graph = RAGGraph(settings, mongodb.db(), llm, factory.create_embedding(), request.app.state.vector_store)
        
        service = EvaluationService(mongodb.db(), llm, graph)
        result = await service.run(payload.dataset_id)
        return ApiResponse(data=result, message="Evaluation run completed")
    except Exception as exc:
        logger.error(f"Failed to run evaluation: {exc}")
        return ApiResponse(success=False, message=str(exc))


@router.get("/runs", response_model=ApiResponse)
async def list_runs() -> ApiResponse:
    try:
        cursor = mongodb.db()["eval_runs"].find({}, {"_id": 0}).sort("created_at", -1).limit(100)
        return ApiResponse(data=[item async for item in cursor], message="Evaluation runs retrieved")
    except Exception as exc:
        logger.error("Failed to list evaluation runs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/runs/{run_id}", response_model=ApiResponse)
async def get_run(run_id: str) -> ApiResponse:
    try:
        return ApiResponse(data=await mongodb.db()["eval_runs"].find_one({"run_id": run_id}, {"_id": 0}), message="Evaluation run retrieved")
    except Exception as exc:
        logger.error("Failed to get evaluation run")
        return ApiResponse(success=False, message=str(exc))
