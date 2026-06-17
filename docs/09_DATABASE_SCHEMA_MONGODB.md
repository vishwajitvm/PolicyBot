# MongoDB Database Schema

**Collections, indexes, and sample records**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. MongoDB role

MongoDB is the metadata, audit, configuration, trace, and application database. It should not be the only retrieval layer unless you intentionally use MongoDB Atlas Vector Search through the vector adapter.

## 2. Collections

Recommended collections:

```text
users
organizations
documents
document_versions
chunks
ingestion_jobs
query_sessions
trace_events
evaluation_sets
evaluation_runs
feedback
system_config
```

## 3. documents collection

```json
{
  "_id": "doc_001",
  "organization_id": "org_001",
  "file_name": "leave_policy_v4.pdf",
  "file_path": "/data/policies/leave_policy_v4.pdf",
  "extension": "pdf",
  "mime_type": "application/pdf",
  "size_bytes": 443201,
  "content_hash": "sha256...",
  "created_at": "2026-05-01T09:10:00Z",
  "modified_at": "2026-05-22T13:00:00Z",
  "indexed_at": "2026-06-18T08:00:00Z",
  "status": "indexed",
  "title": "Leave Policy",
  "version": "v4",
  "effective_date": "2026-06-01",
  "source_type": "local_folder",
  "chunk_count": 42,
  "latest_detected": true,
  "errors": []
}
```

Indexes:

```javascript
db.documents.createIndex({ organization_id: 1, status: 1 })
db.documents.createIndex({ organization_id: 1, content_hash: 1 }, { unique: true })
db.documents.createIndex({ organization_id: 1, file_path: 1 })
db.documents.createIndex({ effective_date: -1 })
db.documents.createIndex({ modified_at: -1 })
```

## 4. chunks collection

MongoDB stores chunk metadata and optional chunk text. Vector DB stores vectors.

```json
{
  "_id": "chunk_001",
  "document_id": "doc_001",
  "organization_id": "org_001",
  "chunk_index": 0,
  "text": "Employees are eligible for...",
  "token_count": 620,
  "section_title": "Eligibility",
  "page_number": 3,
  "embedding_model": "gemini-embedding-001",
  "embedding_dimension": 768,
  "vector_provider": "qdrant",
  "vector_id": "doc_001:hash:0",
  "created_at": "2026-06-18T08:00:00Z"
}
```

Indexes:

```javascript
db.chunks.createIndex({ organization_id: 1, document_id: 1 })
db.chunks.createIndex({ vector_id: 1 }, { unique: true })
db.chunks.createIndex({ section_title: "text", text: "text" })
```

## 5. ingestion_jobs collection

```json
{
  "_id": "job_001",
  "organization_id": "org_001",
  "folder_path": "/data/policies",
  "status": "running",
  "started_at": "2026-06-18T08:00:00Z",
  "completed_at": null,
  "files_seen": 22,
  "files_indexed": 10,
  "files_skipped": 8,
  "files_failed": 1,
  "errors": [
    {
      "file_path": "/data/policies/scanned.pdf",
      "error": "No extractable text found"
    }
  ]
}
```

## 6. query_sessions collection

```json
{
  "_id": "session_001",
  "organization_id": "org_001",
  "user_id": "user_001",
  "question": "What is the latest maternity leave policy?",
  "answer": "According to leave_policy_v4.pdf...",
  "trace_id": "trace_001",
  "scores": {
    "retrieval_relevance": 0.89,
    "answer_confidence": 0.84,
    "citation_coverage": 0.92,
    "freshness_confidence": 0.95,
    "conflict_risk": 0.21
  },
  "created_at": "2026-06-18T09:00:00Z"
}
```

## 7. trace_events collection

```json
{
  "_id": "trace_event_001",
  "trace_id": "trace_001",
  "step_name": "retrieve_candidates",
  "status": "success",
  "message": "Retrieved 30 candidate chunks from Qdrant",
  "payload": {
    "top_k": 30,
    "provider": "qdrant"
  },
  "started_at": "2026-06-18T09:00:01Z",
  "ended_at": "2026-06-18T09:00:02Z",
  "latency_ms": 1000
}
```

Indexes:

```javascript
db.trace_events.createIndex({ trace_id: 1, started_at: 1 })
db.trace_events.createIndex({ step_name: 1 })
db.trace_events.createIndex({ status: 1 })
```

## 8. evaluation_runs collection

```json
{
  "_id": "eval_run_001",
  "name": "MVP regression set",
  "model_provider": "gemini",
  "vector_provider": "qdrant",
  "started_at": "2026-06-18T10:00:00Z",
  "completed_at": "2026-06-18T10:10:00Z",
  "summary": {
    "total_questions": 50,
    "passed": 42,
    "failed": 8,
    "average_retrieval_score": 0.82,
    "average_citation_score": 0.88
  }
}
```

## 9. MongoDB design rules

- Store raw trace payloads, but avoid storing secrets.
- Store chunk text if you need auditability; otherwise store text preview and fetch full text from object storage.
- Create indexes before large ingestion.
- Use `organization_id` in every collection for future multi-tenancy.
- Use TTL indexes only for temporary data, not audit records.
