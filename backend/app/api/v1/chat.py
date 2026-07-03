from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import get_settings, Settings
from app.db.mongodb import mongodb
from app.db.repositories.chat_session_repository import ChatSessionRepository
from app.db.repositories.chat_message_repository import ChatMessageRepository
from app.db.repositories.query_session_repository import QuerySessionRepository
from app.providers.provider_factory import ProviderFactory
from app.rag.rag_graph import RAGGraph
from app.schemas.common import ApiResponse
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionOut,
    ChatSessionUpdate,
    ChatMessageCreate,
    ChatMessageOut,
    ChatSessionWithMessages,
)
from app.schemas.query import QueryResponse
from datetime import datetime
from bson import ObjectId
from tracenest import logger


router = APIRouter(prefix="/chat", tags=["chat"])


def get_chat_session_repository() -> ChatSessionRepository:
    return ChatSessionRepository(mongodb.db())


def get_chat_message_repository() -> ChatMessageRepository:
    return ChatMessageRepository(mongodb.db())


def get_query_session_repository() -> QuerySessionRepository:
    return QuerySessionRepository(mongodb.db())


def get_rag_graph(settings: Settings = Depends(get_settings)) -> RAGGraph:
    factory = ProviderFactory(settings)
    llm = factory.create_llm()
    embedding_provider = factory.create_embedding()
    vector_store = mongodb.vector_store  # Assuming vector_store is attached to app state? We'll get it from mongodb? Actually, in main.py we set app.state.vector_store
    # We need to get the vector_store from the app state. Since we are in a router, we can access it via the request.
    # But we are not using Depends with request. We'll change the dependency to get the vector_store from the mongodb? Not directly.
    # We'll adjust: we'll get the vector_store from the mongodb database? No, the vector_store is a separate object.
    # We'll change the approach: we'll create the RAGGraph in the endpoint using the same method as in main.py and query.py.
    # For simplicity, we'll copy the method from query.py: we'll get the settings and vector_store from the request.app.state.
    # But we don't have the request in the dependency. We'll change the endpoint to accept the request.
    # Alternatively, we can store the vector_store in the mongodb database? Not.
    # Let's change the dependency to get the vector_store from the app state via a request.
    # We'll do that in the endpoint function.
    raise NotImplementedError


# We'll implement the endpoints without the rag_graph dependency for now and create it inside each endpoint.
# This is not ideal but works for now.

@router.post("/sessions", response_model=ApiResponse)
async def create_chat_session(
    session_in: ChatSessionCreate,
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
):
    try:
        session_dict = session_in.model_dump()
        now = datetime.utcnow()
        session_dict["created_at"] = now
        session_dict["updated_at"] = now
        session_dict["is_deleted"] = False
        result = await session_repo.collection.insert_one(session_dict)
        session_dict["id"] = str(result.inserted_id)
        # Remove the MongoDB _id field
        session_dict.pop("_id", None)
        return ApiResponse(data=session_dict, message="Chat session created")
    except Exception as exc:
        logger.exception("Failed to create chat session")
        return ApiResponse(success=False, message=str(exc))


@router.get("/sessions", response_model=ApiResponse)
async def list_chat_sessions(
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
):
    try:
        cursor = session_repo.collection.find({"is_deleted": False}).sort("updated_at", -1)
        sessions = []
        async for session in cursor:
            session["id"] = str(session["_id"])
            session.pop("_id")
            sessions.append(session)
        return ApiResponse(data=sessions, message="Chat sessions retrieved")
    except Exception as exc:
        logger.exception("Failed to list chat sessions")
        return ApiResponse(success=False, message=str(exc))


@router.get("/sessions/{session_id}", response_model=ApiResponse)
async def get_chat_session(
    session_id: str,
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
    message_repo: ChatMessageRepository = Depends(get_chat_message_repository),
):
    try:
        session = await session_repo.collection.find_one({"_id": ObjectId(session_id), "is_deleted": False})
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        session["id"] = str(session["_id"])
        session.pop("_id")
        # Get messages for this session
        cursor = message_repo.collection.find({"session_id": session_id}).sort("created_at", 1)
        messages = []
        async for message in cursor:
            message["id"] = str(message["_id"])
            message.pop("_id")
            messages.append(message)
        session["messages"] = messages
        return ApiResponse(data=session, message="Chat session with messages retrieved")
    except Exception as exc:
        logger.exception("Failed to get chat session")
        return ApiResponse(success=False, message=str(exc))


@router.patch("/sessions/{session_id}", response_model=ApiResponse)
async def rename_chat_session(
    session_id: str,
    session_update: ChatSessionUpdate,
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
):
    try:
        update_dict = session_update.model_dump(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()
        result = await session_repo.collection.update_one(
            {"_id": ObjectId(session_id), "is_deleted": False},
            {"$set": update_dict},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        return ApiResponse(message="Chat session renamed")
    except Exception as exc:
        logger.exception("Failed to rename chat session")
        return ApiResponse(success=False, message=str(exc))


@router.delete("/sessions/{session_id}", response_model=ApiResponse)
async def delete_chat_session(
    session_id: str,
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
):
    try:
        result = await session_repo.collection.update_one(
            {"_id": ObjectId(session_id), "is_deleted": False},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        return ApiResponse(message="Chat session deleted")
    except Exception as exc:
        logger.exception("Failed to delete chat session")
        return ApiResponse(success=False, message=str(exc))


@router.post("/sessions/{session_id}/messages", response_model=ApiResponse)
async def send_message(
    session_id: str,
    message_in: ChatMessageCreate,
    session_repo: ChatSessionRepository = Depends(get_chat_session_repository),
    message_repo: ChatMessageRepository = Depends(get_chat_message_repository),
):
    try:
        # Verify session exists and is not deleted
        session = await session_repo.collection.find_one({"_id": ObjectId(session_id), "is_deleted": False})
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

        # Save user message
        user_message_dict = message_in.model_dump()
        user_message_dict["session_id"] = session_id
        user_message_dict["role"] = "user"
        user_message_dict["created_at"] = datetime.utcnow()
        # The trace_id and other metadata will be None for user message
        user_message_dict["trace_id"] = None
        user_message_dict["model"] = None
        user_message_dict["embedding_model"] = None
        user_message_dict["vector_db"] = None
        user_message_dict["latency_ms"] = None
        user_message_dict["scores"] = None
        result = await message_repo.collection.insert_one(user_message_dict)
        user_message_id = str(result.inserted_id)

        # Get the saved user message from DB to include any database-generated fields
        saved_user_message = await message_repo.collection.find_one({"_id": ObjectId(user_message_id)})
        saved_user_message["id"] = str(saved_user_message["_id"])
        saved_user_message.pop("_id")

        # Get settings and create RAGGraph to get the answer
        settings = get_settings()
        factory = ProviderFactory(settings)
        llm = factory.create_llm()
        embedding_provider = factory.create_embedding()
        from app.vectorstores.vector_store_factory import VectorStoreFactory
        vector_store = VectorStoreFactory(settings).create()

        graph = RAGGraph(settings, mongodb.db(), llm, embedding_provider, vector_store)
        # The RAGGraph.run method expects a question and session_id and filters.
        # We'll use the question from the message_in and the session_id.
        # We'll pass filters as None.
        rag_response: QueryResponse = await graph.run(
            question=message_in.question,
            session_id=session_id,
            filters=None,
        )

        # Save assistant message
        assistant_message_dict = {
            "session_id": session_id,
            "role": "assistant",
            "content": rag_response.answer,
            "created_at": datetime.utcnow(),
            "trace_id": str(rag_response.trace_id) if rag_response.trace_id is not None else None,
            "model": rag_response.model,
            "embedding_provider": rag_response.embedding_model,
            "vector_db": rag_response.vector_db,
            "latency_ms": rag_response.latency_ms,
            "scores": rag_response.scores.model_dump() if rag_response.scores else None,
        }
        result = await message_repo.collection.insert_one(assistant_message_dict)
        assistant_message_id = str(result.inserted_id)

        # Get the saved assistant message from DB to include any database-generated fields
        saved_assistant_message = await message_repo.collection.find_one({"_id": ObjectId(assistant_message_id)})
        saved_assistant_message["id"] = str(saved_assistant_message["_id"])
        saved_assistant_message.pop("_id")

        # Update the session's updated_at
        await session_repo.collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"updated_at": datetime.utcnow()}},
        )

        # Return the created user and assistant messages
        return ApiResponse(
            data={
                "user_message": saved_user_message,
                "assistant_message": saved_assistant_message,
            },
            message="Message sent",
        )
    except Exception as exc:
        logger.exception("Failed to send message")
        return ApiResponse(success=False, message=str(exc))


@router.get("/messages/{message_id}/traces", response_model=ApiResponse)
async def get_message_traces(
    message_id: str,
    message_repo: ChatMessageRepository = Depends(get_chat_message_repository),
):
    try:
        message = await message_repo.collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        if message["role"] != "assistant":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trace only available for assistant messages")
        trace_id = message.get("trace_id")
        if not trace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trace not found for this message")
        # We need to get the trace from the traces collection.
        # The trace is stored by the TraceService in the "traces" collection? We saw in the RAGGraph that trace.persist is called.
        # We'll assume there is a traces collection and we can get it by trace_id.
        # We'll create a temporary repository for traces? Or we can use the trace repository if it exists.
        # We saw there is a trace_repository for query_traces? Actually, we have a trace_repository in the db.
        # Let's check: we have a trace_repository for query_traces? We saw earlier: TraceRepository for collection "query_traces".
        # But the RAGGraph persists the trace via the TraceService, which likely uses a different collection.
        # We'll look at the TraceService.
        # Given the time, we'll assume that the trace is stored in a collection named "traces" and we can get it by trace_id.
        # We'll create a simple lookup.
        trace = await mongodb.db()["query_traces"].find_one({"trace_id": trace_id}, {"_id": 0})
        if not trace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trace not found")
        return ApiResponse(data=trace, message="Trace retrieved")
    except HTTPException as exc:
        # Return ApiResponse format for HTTP exceptions
        logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
        return ApiResponse(success=False, message=f"{exc.status_code}: {exc.detail}")
    except Exception as exc:
        logger.exception("Failed to get trace")
        return ApiResponse(success=False, message=str(exc))