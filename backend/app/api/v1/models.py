from fastapi import APIRouter
from app.core.models_registry import AVAILABLE_MODELS
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/models", tags=["models"])

@router.get("/")
def get_available_models() -> ApiResponse:
    return ApiResponse(data=AVAILABLE_MODELS, message="Models retrieved successfully")
