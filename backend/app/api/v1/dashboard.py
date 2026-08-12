from fastapi import APIRouter
from app.core.config import get_settings
from app.schemas.common import ApiResponse
from app.db.repositories.document_repository import DocumentRepository
from app.db.repositories.chunk_repository import ChunkRepository
from app.db.repositories.source_repository import SourceRepository
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.db.repositories.trace_repository import TraceRepository
from app.db.mongodb import mongodb

router = APIRouter()

@router.get("/dashboard/stats", response_model=ApiResponse)
async def get_dashboard_stats() -> ApiResponse:
    try:
        settings = get_settings()
        db = mongodb.db()
        doc_repo = DocumentRepository(db)
        chunk_repo = ChunkRepository(db)
        source_repo = SourceRepository(db)
        job_repo = IngestionJobRepository(db)
        trace_repo = TraceRepository(db)

        # Documents indexed: count of documents
        documents_indexed = await doc_repo.collection.count_documents({})

        # Chunks indexed: count of chunks
        chunks_indexed = await chunk_repo.collection.count_documents({})

        # Sources connected: count of sources with status "connected"
        sources_connected = await source_repo.collection.count_documents({"status": "connected"})

        # Running jobs: count of ingestion jobs with status "running"
        running_jobs = await job_repo.collection.count_documents({"status": "running"})

        # Average confidence and accuracy trend
        traces = await trace_repo.find_many()
        average_confidence = 0.0
        accuracy_trend = []
        if traces:
            confidences = []
            for t in traces:
                scores = t.get("scores", {})
                if isinstance(scores, dict) and "answer_confidence" in scores:
                    conf = scores["answer_confidence"]
                    confidences.append(conf)
                    
                    # Extract timestamp for trend
                    ts = t.get("timestamp") or t.get("created_at") or t.get("ts")
                    if ts:
                        accuracy_trend.append({
                            "timestamp": ts if isinstance(ts, str) else ts.isoformat(),
                            "confidence": round(conf * 100, 2),
                            "latency": t.get("latency_ms", 0)
                        })
            
            if confidences:
                average_confidence = sum(confidences) / len(confidences)
                
            # Sort trend by timestamp
            accuracy_trend.sort(key=lambda x: x["timestamp"])

        # Latest query latency: latency_ms of the most recent trace
        latest_query_latency = 0
        if traces:
            # Try to get timestamp from each trace
            traces_with_ts = []
            for t in traces:
                ts = t.get("timestamp") or t.get("created_at") or t.get("ts")
                if ts is not None:
                    traces_with_ts.append((ts, t))
            if traces_with_ts:
                # Sort by timestamp descending
                traces_with_ts.sort(key=lambda x: x[0], reverse=True)
                latest_trace = traces_with_ts[0][1]
                latest_query_latency = latest_trace.get("latency_ms", 0)
            else:
                # If no timestamp, just take the first trace's latency
                latest_query_latency = traces[0].get("latency_ms", 0)

        # Configuration details
        chunk_size = settings.chunk_size
        llm_provider = settings.llm_provider
        embedding_provider = settings.embedding_provider
        vector_db_provider = settings.vector_db_provider

        stats = {
            "documents_indexed": documents_indexed,
            "chunks_indexed": chunks_indexed,
            "sources_connected": sources_connected,
            "running_jobs": running_jobs,
            "average_confidence": round(average_confidence * 100, 2),  # Convert to percentage
            "accuracy_trend": accuracy_trend,
            "latest_query_latency": latest_query_latency,
            "active_llm_provider": llm_provider,  # Keeping for backward compatibility
            "active_vector_db": vector_db_provider,  # Keeping for backward compatibility
            "chunk_size": chunk_size,
            "llm_provider": llm_provider,
            "embedding_provider": embedding_provider,
            "vector_db_provider": vector_db_provider,
        }

        return ApiResponse(data=stats, message="Dashboard stats retrieved successfully")
    except Exception as exc:
        # Log the exception (in a real app, use logging)
        return ApiResponse(success=False, message=str(exc))