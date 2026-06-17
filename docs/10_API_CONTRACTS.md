# API Contracts

**REST endpoint design for backend/frontend integration**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. API prefix

```text
/api/v1
```

## 2. Health endpoints

### GET `/health`

Response:

```json
{
  "status": "ok",
  "service": "policybot-api",
  "version": "0.1.0"
}
```

### GET `/health/ready`

Response:

```json
{
  "ready": true,
  "dependencies": {
    "mongodb": "ok",
    "vector_db": "ok",
    "redis": "ok",
    "model_provider": "ok"
  }
}
```

## 3. Chat endpoints

### POST `/chat/ask`

Request:

```json
{
  "question": "What is the latest maternity leave policy?",
  "filters": {
    "document_type": "policy"
  },
  "stream_trace": true
}
```

Response:

```json
{
  "trace_id": "trace_001",
  "answer": "According to leave_policy_v4.pdf, ...",
  "citations": [
    {
      "document_id": "doc_001",
      "file_name": "leave_policy_v4.pdf",
      "page_number": 3,
      "section_title": "Maternity Leave",
      "quote": "Employees are eligible..."
    }
  ],
  "sources": [
    {
      "document_id": "doc_001",
      "file_name": "leave_policy_v4.pdf",
      "effective_date": "2026-06-01",
      "freshness_label": "latest"
    }
  ],
  "scores": {
    "retrieval_relevance": 0.89,
    "answer_confidence": 0.84,
    "citation_coverage": 0.92,
    "freshness_confidence": 0.95,
    "conflict_risk": 0.21
  },
  "warnings": []
}
```

### GET `/traces/{trace_id}`

Returns full trace events.

### GET `/traces/{trace_id}/stream`

SSE stream response:

```text
event: trace_step
data: {"step_name":"retrieve_candidates","status":"success","message":"Retrieved 30 chunks"}
```

## 4. Document endpoints

### GET `/documents`

Query params:

```text
?page=1&page_size=20&status=indexed&search=leave
```

Response:

```json
{
  "items": [
    {
      "document_id": "doc_001",
      "file_name": "leave_policy_v4.pdf",
      "status": "indexed",
      "chunk_count": 42,
      "created_at": "2026-05-01T00:00:00Z",
      "modified_at": "2026-05-22T00:00:00Z",
      "effective_date": "2026-06-01",
      "version": "v4"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### POST `/documents/{document_id}/reindex`

Response:

```json
{
  "job_id": "job_123",
  "status": "queued"
}
```

### DELETE `/documents/{document_id}`

Deletes document metadata and removes vectors.

## 5. Ingestion endpoints

### POST `/ingestion/sync-folder`

Request:

```json
{
  "folder_path": "/data/policies",
  "recursive": true,
  "force_reindex": false
}
```

Response:

```json
{
  "job_id": "job_001",
  "status": "queued"
}
```

### GET `/ingestion/jobs/{job_id}`

Response:

```json
{
  "job_id": "job_001",
  "status": "running",
  "files_seen": 22,
  "files_indexed": 10,
  "files_failed": 1
}
```

## 6. Evaluation endpoints

### POST `/evaluations/run`

Request:

```json
{
  "dataset_id": "eval_set_001",
  "limit": 50
}
```

Response:

```json
{
  "evaluation_run_id": "eval_run_001",
  "status": "queued"
}
```

## 7. Settings endpoints

### GET `/settings/providers`

Response:

```json
{
  "llm_provider": "gemini",
  "embedding_provider": "gemini",
  "vector_db_provider": "qdrant",
  "metadata_db_provider": "mongodb"
}
```

## 8. Error response format

```json
{
  "error": {
    "code": "VECTOR_DB_UNAVAILABLE",
    "message": "Vector database is not reachable",
    "trace_id": "trace_001",
    "details": {}
  }
}
```
