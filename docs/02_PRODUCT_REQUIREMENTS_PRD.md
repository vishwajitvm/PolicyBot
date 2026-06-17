# Product Requirements Document

**Detailed product requirements for MVP and scalable version**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Product name

Working name: **PolicyBot Intelligence**.

Possible alternate names:

- PolicyBot AI
- PolicyIQ
- SmartPolicy Assistant
- PolicyLens
- Document Intelligence Bot

## 2. Primary users

| User type | Needs |
|---|---|
| Employee/User | Ask questions and get trusted answers from latest documents |
| Admin | Upload/sync files, manage documents, monitor quality |
| Developer | Debug retrieval, traces, model outputs, failures |
| Client/Manager | Review product value, accuracy, usage, and deployment readiness |

## 3. Core MVP requirements

### Document ingestion

- User configures a local folder path.
- System scans files recursively.
- System computes file hash to detect duplicate or changed files.
- System extracts file metadata: file name, path, created date, modified date, extension, size, owner if available.
- System extracts text using loaders/parsers.
- System chunks text with overlap.
- System generates embeddings.
- System upserts chunks into vector DB.
- System stores document/chunk metadata in MongoDB.

### Question answering

- User asks a natural language question.
- Backend creates a query trace.
- Query is optionally rewritten for retrieval.
- Retriever searches vector DB.
- Backend applies metadata filters when needed.
- Backend reranks top chunks.
- Backend resolves document freshness.
- Backend detects conflicting source versions.
- LLM generates final answer with citations.
- System validates whether answer uses retrieved evidence.
- UI displays answer, citations, scores, and trace timeline.

### Traceability

The user should see:

- question received,
- query rewrite,
- embedding generated,
- vector DB searched,
- number of chunks found,
- top documents,
- reranking score,
- freshness decision,
- final answer generation,
- citation verification,
- confidence calculation.

### Scoring

Minimum MVP scores:

- retrieval relevance score,
- answer confidence score,
- citation coverage score,
- freshness confidence score,
- conflict risk score.

## 4. Non-functional requirements

| Area | Requirement |
|---|---|
| Scalability | Should support thousands of documents in MVP and scale to larger corpora later |
| Reliability | Ingestion jobs should be restartable and idempotent |
| Security | API keys stored in env, not in code |
| Observability | Every query and ingestion job should have logs and trace records |
| Portability | Docker Compose should run the system locally |
| Extensibility | Vector DB and model providers must be swappable |
| Maintainability | Clear service interfaces and modular repo structure |

## 5. Out of scope for first 10 days

- Full enterprise SSO.
- Complex document permissions per paragraph.
- Fine-tuned models.
- Human approval workflow.
- Real-time collaborative editing.
- Fully automated legal/compliance decision making.

## 6. Acceptance criteria

### Ingestion acceptance

- Given a folder with 10+ documents, the system ingests them successfully.
- Given a changed file, the system detects the change and re-indexes only that file.
- Given duplicate content, the system avoids duplicate indexing by hash.
- Given an unsupported file, the system records an error without crashing.

### Retrieval acceptance

- Given a question that exists in one document, system returns the correct source.
- Given a question that exists in multiple documents, system prefers the latest version.
- Given conflicting documents, system warns the user and shows both sources.
- Given no relevant content, system says it does not have enough information.

### UI acceptance

- User can ask a question.
- User can see answer, citations, source documents, and trace steps.
- Admin can see indexed documents and ingestion status.
- Developer can inspect logs/scores for a query.

## 7. Future feature backlog

- Document version comparison.
- Manual source pinning.
- Re-index selected folder.
- Document approval status.
- Role-based document visibility.
- Slack/Teams bot integration.
- Scheduled nightly ingestion.
- Dataset-based regression testing.
- Feedback loop for answer improvement.
