# Backend Architecture

**FastAPI + LangGraph + MongoDB + Vector DB + Gemini**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Backend responsibilities

The backend is the intelligence layer of PolicyBot. It handles document ingestion, vector indexing, question answering, trace generation, scoring, and API responses.

## 2. Backend layers

```text
API Routes
  ↓
Application Services
  ↓
LangGraph Workflow / Ingestion Pipeline
  ↓
Adapters: MongoDB, Vector DB, Model Provider, File System, Queue
```

## 3. API route modules

| Module | Endpoints |
|---|---|
| `chat.py` | ask question, stream trace, get chat history |
| `documents.py` | list documents, get document detail, delete document, reindex document |
| `ingestion.py` | trigger folder scan, job status, sync status |
| `evaluations.py` | run eval set, list eval results, compare runs |
| `health.py` | health, readiness, dependency status |
| `admin.py` | config, provider status, index stats |

## 4. LangGraph nodes

```text
START
  → validate_question
  → classify_question
  → rewrite_query
  → embed_query
  → retrieve_candidates
  → rerank_candidates
  → resolve_freshness
  → detect_conflicts
  → build_context
  → generate_answer
  → verify_citations
  → calculate_scores
  → persist_trace
END
```

## 5. Graph state design

```python
class RAGState(TypedDict):
    trace_id: str
    user_id: str | None
    question: str
    rewritten_query: str | None
    query_embedding: list[float] | None
    filters: dict
    retrieved_chunks: list[dict]
    reranked_chunks: list[dict]
    selected_sources: list[dict]
    freshness_decisions: list[dict]
    conflicts: list[dict]
    answer: str | None
    citations: list[dict]
    scores: dict
    errors: list[dict]
```

## 6. Ingestion pipeline

```text
scan_folder
  → detect_file_change
  → create_ingestion_job
  → parse_document
  → extract_metadata
  → split_into_chunks
  → generate_embeddings
  → upsert_vector_db
  → save_mongodb_records
  → mark_job_complete
```

## 7. MongoDB usage

MongoDB is not replacing the vector database. It stores the control-plane and audit data:

- file metadata,
- document versions,
- chunk metadata,
- job states,
- query sessions,
- trace events,
- evaluation scores,
- feedback.

## 8. Vector DB usage

The vector DB stores one record per chunk:

```json
{
  "id": "chunk_123",
  "values": [0.012, -0.044, 0.801],
  "metadata": {
    "document_id": "doc_abc",
    "chunk_id": "chunk_123",
    "file_name": "leave_policy_v4.pdf",
    "created_at": "2026-05-01T00:00:00Z",
    "modified_at": "2026-05-22T00:00:00Z",
    "effective_date": "2026-06-01",
    "version": "v4",
    "section_title": "Annual Leave",
    "page": 3,
    "text_preview": "Employees are eligible..."
  }
}
```

## 9. Freshness resolver

The freshness resolver ranks sources using weighted signals:

| Signal | Weight |
|---|---:|
| effective date inside document | 35% |
| explicit policy version | 25% |
| file modified date | 20% |
| file created date | 10% |
| admin-approved current flag | 10% |

If an older document has stronger semantic relevance but a newer document has the same policy topic, the resolver should prefer the newer document and show a freshness note.

## 10. Backend scalability plan

### MVP

- Single FastAPI container.
- One worker container.
- MongoDB container or Atlas.
- Qdrant container or Pinecone cloud.

### Growth stage

- Multiple API replicas.
- Multiple worker replicas.
- Redis queue.
- Managed MongoDB Atlas.
- Managed Pinecone/Qdrant Cloud.
- Object storage for original documents.

### Enterprise stage

- Kubernetes.
- Horizontal pod autoscaling.
- Dedicated vector DB cluster.
- Multi-tenant database separation.
- Centralized logs and metrics.
- SSO and RBAC.

## 11. Backend failure handling

| Failure | Handling |
|---|---|
| Gemini API rate limit | Retry with backoff, queue job, show temporary status |
| Vector DB unavailable | Return dependency error, keep API healthy but retrieval disabled |
| File parsing fails | Mark document as failed, keep error details |
| Embedding dimension mismatch | Block index write and require index recreation |
| MongoDB down | API readiness should fail |
| Worker crash | Job remains retryable |

## 12. Backend implementation order

1. Config and app skeleton.
2. MongoDB connection and repositories.
3. Vector DB adapter.
4. Model provider adapter.
5. Ingestion pipeline.
6. LangGraph query graph.
7. Trace writer.
8. Scoring.
9. API endpoints.
10. Tests and Docker.
