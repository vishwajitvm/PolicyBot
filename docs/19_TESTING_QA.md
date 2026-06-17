# Testing and QA Guide

**Unit, integration, E2E, and RAG quality testing**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Testing layers

| Layer | What to test |
|---|---|
| Unit tests | Chunking, metadata extraction, freshness scoring, provider config |
| Integration tests | MongoDB, vector DB, model adapter mock, ingestion pipeline |
| API tests | FastAPI endpoints and error formats |
| Frontend tests | Chat rendering, trace timeline, document list |
| RAG evaluation | Retrieval and answer accuracy |
| E2E tests | Full user flow from ingestion to answer |

## 2. Backend unit tests

Test modules:

```text
tests/unit/test_chunker.py
tests/unit/test_metadata_extractor.py
tests/unit/test_freshness_resolver.py
tests/unit/test_scorer.py
tests/unit/test_config.py
```

Run:

```bash
pytest tests/unit -q
```

## 3. Integration tests

Test:

- MongoDB connection,
- Qdrant collection creation,
- vector upsert/search,
- ingestion job creation,
- document re-indexing.

Run:

```bash
pytest tests/integration -q
```

## 4. API tests

Use `httpx` test client.

Required tests:

- health endpoint,
- ask question endpoint,
- ingestion trigger endpoint,
- documents list endpoint,
- trace endpoint,
- error response format.

## 5. RAG evaluation tests

Create a dataset:

```json
[
  {
    "question": "What is the latest leave policy?",
    "expected_source_files": ["leave_policy_v4.pdf"],
    "expected_keywords": ["leave", "eligible"],
    "must_not_use_files": ["leave_policy_v2.pdf"]
  }
]
```

Run:

```bash
python -m app.cli.evaluate --dataset ./eval/policy_questions.json
```

## 6. QA checklist

### Ingestion QA

- [ ] PDF indexed.
- [ ] DOCX indexed.
- [ ] TXT/MD indexed.
- [ ] Duplicate file skipped.
- [ ] Modified file re-indexed.
- [ ] Failed file logged.

### Retrieval QA

- [ ] Relevant source appears in top results.
- [ ] Latest version is preferred.
- [ ] Conflicting old document is flagged.
- [ ] No answer is returned when context is weak.

### UI QA

- [ ] Answer visible.
- [ ] Citations visible.
- [ ] Trace timeline visible.
- [ ] Scores visible.
- [ ] Document status visible.
- [ ] Loading and error states work.

### Deployment QA

- [ ] Docker starts clean.
- [ ] Health endpoints pass.
- [ ] Env variables loaded.
- [ ] Logs show no secrets.
- [ ] API docs accessible in dev.

## 7. Performance checks

Track:

- ingestion time per file,
- embedding time per chunk,
- vector search latency,
- answer generation latency,
- total chat latency,
- memory usage,
- failed job count.

## 8. Regression rule

Any change to embedding model, vector DB provider, chunking, or reranking must run evaluation before merge.
