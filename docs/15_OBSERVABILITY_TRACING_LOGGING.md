# Observability, Tracing, and Logging

**How to show intelligence and debug the RAG process**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Observability goal

PolicyBot should not behave like a black box. Every answer should be explainable through trace events, retrieved sources, scores, and logs.

## 2. Three levels of visibility

| Level | Audience | Data shown |
|---|---|---|
| User trace | End user | Friendly timeline and source cards |
| Developer trace | Developer | Step payloads, scores, timings, raw candidates |
| System logs | Operator | Structured logs, errors, latency, dependency health |

## 3. Trace event schema

```json
{
  "trace_id": "trace_001",
  "step_name": "retrieve_candidates",
  "status": "success",
  "message": "Retrieved 30 candidate chunks",
  "visible_to_user": true,
  "payload": {
    "provider": "qdrant",
    "top_k": 30,
    "latency_ms": 142
  },
  "created_at": "2026-06-18T09:00:01Z"
}
```

## 4. Required trace steps

```text
question_received
query_classified
query_rewritten
query_embedded
vector_search_started
vector_search_completed
reranking_completed
freshness_resolved
conflicts_detected
context_built
answer_generated
citations_verified
scores_calculated
response_returned
```

## 5. User-visible trace messages

| Internal step | User message |
|---|---|
| query_rewritten | I converted your question into a search-friendly query. |
| vector_search_completed | I searched the indexed policy knowledge base. |
| reranking_completed | I ranked the most relevant document sections. |
| freshness_resolved | I checked which matching policy appears newest. |
| conflicts_detected | I found older or conflicting documents. |
| citations_verified | I checked that the answer is supported by sources. |

## 6. Structured logging

Use structured JSON logs:

```json
{
  "level": "info",
  "event": "vector_search_completed",
  "trace_id": "trace_001",
  "provider": "qdrant",
  "top_k": 30,
  "latency_ms": 142
}
```

## 7. Metrics to track

| Metric | Why it matters |
|---|---|
| chat_request_count | Usage volume |
| chat_latency_ms | User experience |
| retrieval_latency_ms | Vector DB performance |
| generation_latency_ms | LLM performance |
| ingestion_jobs_total | Ingestion volume |
| ingestion_failures_total | Parser/data quality issues |
| average_retrieval_score | RAG quality |
| no_answer_rate | Missing knowledge |
| conflict_rate | Outdated document risk |

## 8. UI intelligence scorecard

The UI can show:

```text
Retrieval: 89%
Freshness: 95%
Citations: 92%
Answer Confidence: 84%
Conflict Risk: 21%
```

This makes the product feel advanced while also helping users trust the answer.

## 9. Developer debug view

For each query, developer should be able to inspect:

- original question,
- rewritten query,
- model provider,
- embedding provider,
- vector DB provider,
- candidate chunks,
- raw vector scores,
- reranking scores,
- freshness decision,
- prompt context,
- final answer,
- verifier result.

## 10. Error logging rules

- Log full stack trace internally.
- Return safe error message to frontend.
- Never log API keys.
- Never log full sensitive document text unless explicitly allowed.
- Link every error to a trace ID.
