# PolicyBot Intelligence — Advanced Scalable RAG Architecture Pack v2

Updated: **2026-06-18**

This package is a complete documentation and architecture starter pack for building a scalable RAG product under the working name **PolicyBot Intelligence**.

## What changed in v2

- Added a dedicated **Vector Database Strategy**. RAG is not complete without a proper vector store.
- Added recommended free/low-cost vector DB options: **Qdrant**, **Pinecone**, **Chroma**, and **MongoDB Atlas Vector Search** as an optional combined-store strategy.
- Added detailed setup, Docker, deployment, environment config, commands, DB schema, API contracts, scoring, logging, tracing, and operations docs.
- Added Word `.docx` versions of the Markdown documents in `docs/word/`.
- Updated all backend, frontend, and full-stack diagrams to include vector DB, queues, traces, and model-provider switching.
- Added Docker and config templates in `templates/`.

## Recommended architecture choice

For your 10-day MVP, use:

| Layer | Recommended choice | Reason |
|---|---|---|
| API backend | FastAPI | Fast async Python API, easy OpenAPI docs |
| Workflow engine | LangGraph | Step-by-step graph, traceable state, checkpoints |
| RAG utilities | LangChain | Loaders, retrievers, vector DB adapters |
| Metadata DB | MongoDB | Documents, users, traces, evaluations, file versions |
| Vector DB | Qdrant local/self-host or Pinecone serverless | Real semantic search layer |
| LLM | Gemini API | Start fast and low-cost |
| Embeddings | Gemini Embedding | Same provider path for first version |
| Background jobs | Redis + worker | Async ingestion, re-indexing, evaluation jobs |
| Frontend | React + Tailwind | Fast UI for chat, traces, scores, documents |
| Local deployment | Docker Compose | Repeatable dev setup |

## Folder structure

```text
policybot_rag_architecture_pack_v2/
├── README.md
├── docs/
│   ├── 00_INDEX.md
│   ├── 01_PRODUCT_BRIEF_CLIENT.md
│   ├── 02_PRODUCT_REQUIREMENTS_PRD.md
│   ├── 03_DEVELOPER_TECHNICAL_SPEC.md
│   ├── 04_ARCHITECTURE_OVERVIEW.md
│   ├── 05_BACKEND_ARCHITECTURE.md
│   ├── 06_FRONTEND_ARCHITECTURE.md
│   ├── 07_RAG_PIPELINE_FLOW.md
│   ├── 08_VECTOR_DATABASE_STRATEGY.md
│   ├── 09_DATABASE_SCHEMA_MONGODB.md
│   ├── 10_API_CONTRACTS.md
│   ├── 11_SETUP_LOCAL.md
│   ├── 12_CONFIGURATION_ENV.md
│   ├── 13_DOCKER_GUIDE.md
│   ├── 14_DEPLOYMENT_GUIDE.md
│   ├── 15_OBSERVABILITY_TRACING_LOGGING.md
│   ├── 16_EVALUATION_SCORING.md
│   ├── 17_SECURITY_ACCESS_CONTROL.md
│   ├── 18_10_DAY_BUILD_PLAN.md
│   ├── 19_TESTING_QA.md
│   ├── 20_OPERATIONS_RUNBOOK.md
│   ├── 21_MODEL_PROVIDER_SWITCHING.md
│   ├── 22_COMMANDS_CHEATSHEET.md
│   ├── 23_REFERENCES.md
│   └── word/
│       └── .docx versions of each major document
├── diagrams/
│   ├── backend_architecture.png
│   ├── frontend_architecture.png
│   ├── full_stack_architecture.png
│   ├── backend_architecture.drawio
│   ├── frontend_architecture.drawio
│   └── full_stack_architecture.drawio
├── templates/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   ├── Makefile
│   └── policybot.config.yaml
└── examples/
    └── sample_query_trace.json
```

## How to read this pack

Start with:

1. `docs/01_PRODUCT_BRIEF_CLIENT.md` for client-facing explanation.
2. `docs/04_ARCHITECTURE_OVERVIEW.md` for the complete architecture.
3. `docs/08_VECTOR_DATABASE_STRATEGY.md` for Pinecone/Qdrant/Chroma/MongoDB choices.
4. `docs/11_SETUP_LOCAL.md` and `docs/13_DOCKER_GUIDE.md` for setup.
5. `docs/18_10_DAY_BUILD_PLAN.md` for execution.

## Important architecture decision

Use **MongoDB for metadata and audit data**. Use **Qdrant/Pinecone/Chroma/MongoDB Atlas Vector Search for vectors**. Do not store only raw documents in MongoDB and call it RAG. The vector DB layer is responsible for high-dimensional similarity search over chunks, metadata filters, document freshness, and semantic retrieval.

## Default MVP recommendation

Use this for fastest 10-day build:

```env
VECTOR_DB_PROVIDER=qdrant
VECTOR_DB_MODE=local_docker
LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini
METADATA_DB_PROVIDER=mongodb
```

Then later switch to Pinecone without rewriting business logic:

```env
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=policybot-prod
```

## Included architecture images

- `diagrams/backend_architecture.png`
- `diagrams/frontend_architecture.png`
- `diagrams/full_stack_architecture.png`

Each diagram also has a `.drawio` file that can be imported into draw.io / diagrams.net.
