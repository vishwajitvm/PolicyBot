from fastapi import APIRouter, Request

from app.db.mongodb import mongodb
from app.providers.provider_factory import ProviderFactory
from app.rag.rag_graph import RAGGraph
from app.schemas.common import ApiResponse
from app.schemas.query import QueryRequest

router = APIRouter(prefix="/query")


@router.post("", response_model=ApiResponse)
async def query(payload: QueryRequest, request: Request) -> ApiResponse:
    settings = request.app.state.settings
    factory = ProviderFactory(settings)
    graph = RAGGraph(settings, mongodb.db(), factory.create_llm(), factory.create_embedding(), request.app.state.vector_store)
    response = await graph.run(payload.question, payload.session_id, payload.filters)
    return ApiResponse(data=response.model_dump())


@router.get("/sessions", response_model=ApiResponse)
async def list_sessions() -> ApiResponse:
    cursor = mongodb.db()["query_sessions"].find({}, {"_id": 0}).limit(50)
    return ApiResponse(data=[item async for item in cursor])


@router.get("/sessions/{session_id}", response_model=ApiResponse)
async def get_session(session_id: str) -> ApiResponse:
    item = await mongodb.db()["query_sessions"].find_one({"session_id": session_id}, {"_id": 0})
    return ApiResponse(data=item)
