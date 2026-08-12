from tracenest import logger
from fastapi import APIRouter

from app.core.exceptions import NotFoundError
from app.db.mongodb import mongodb
from app.db.repositories.trace_repository import TraceRepository
from app.schemas.common import ApiResponse


router = APIRouter(prefix="/traces")




@router.get("/", response_model=ApiResponse)
async def list_traces() -> ApiResponse:
    try:
        traces = await TraceRepository(mongodb.db()).find_many()
        # Sort by timestamp descending if present
        traces.sort(key=lambda t: t.get("timestamp", ""), reverse=True)
        return ApiResponse(data=traces, message="Traces list retrieved")
    except Exception as exc:
        logger.error("Failed to list traces")
        return ApiResponse(success=False, message=str(exc))
@router.get("/{trace_id}", response_model=ApiResponse)
async def get_trace(trace_id: str) -> ApiResponse:
    try:
        trace = await TraceRepository(mongodb.db()).get(trace_id)
        if not trace:
            raise NotFoundError(f"Trace not found: {trace_id}")
        return ApiResponse(data=trace, message="Trace retrieved")
    except NotFoundError:
        raise
    except Exception as exc:
        logger.error("Failed to get trace")
        return ApiResponse(success=False, message=str(exc))
