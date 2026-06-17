# Configuration and Environment Variables

**Every config variable explained**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Configuration principle

All provider choices should be controlled by environment variables. Do not hardcode Gemini, Pinecone, Qdrant, or MongoDB logic into routes.

## 2. Core app config

```env
APP_NAME=PolicyBot Intelligence
APP_ENV=development
APP_VERSION=0.1.0
API_PREFIX=/api/v1
LOG_LEVEL=INFO
```

## 3. Backend server config

```env
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_WORKERS=1
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 4. MongoDB config

```env
MONGODB_URI=mongodb://mongodb:27017/policybot
MONGODB_DB_NAME=policybot
MONGODB_CONNECT_TIMEOUT_MS=5000
```

## 5. Redis config

```env
REDIS_URL=redis://redis:6379/0
QUEUE_NAME=policybot-jobs
```

## 6. Model provider config

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_TEMPERATURE=0.2
LLM_MAX_OUTPUT_TOKENS=2048
```

Future options:

```env
LLM_PROVIDER=openai | anthropic | ollama | gemini
```

## 7. Embedding config

```env
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini-embedding-001
VECTOR_DIMENSION=768
EMBEDDING_BATCH_SIZE=16
```

Rule: if `EMBEDDING_MODEL` or `VECTOR_DIMENSION` changes, rebuild the vector index.

## 8. Gemini config

```env
GEMINI_API_KEY=your_key
GEMINI_TIMEOUT_SECONDS=60
GEMINI_MAX_RETRIES=3
```

## 9. Vector DB common config

```env
VECTOR_DB_PROVIDER=qdrant
VECTOR_DB_COLLECTION=policybot_chunks
VECTOR_DISTANCE=cosine
VECTOR_TOP_K=30
RERANK_TOP_K=8
```

## 10. Qdrant config

```env
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=policybot_chunks
```

## 11. Pinecone config

```env
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=policybot-chunks
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

## 12. Chroma config

```env
CHROMA_HOST=chroma
CHROMA_PORT=8000
CHROMA_COLLECTION=policybot_chunks
```

## 13. MongoDB Atlas Vector Search config

```env
MONGODB_VECTOR_COLLECTION=chunk_vectors
MONGODB_VECTOR_INDEX=policybot_vector_index
```

## 14. Ingestion config

```env
DOCUMENT_ROOT_PATH=/app/data/policies
SUPPORTED_EXTENSIONS=.pdf,.docx,.txt,.md,.csv,.xlsx,.html
CHUNK_SIZE_TOKENS=700
CHUNK_OVERLAP_TOKENS=120
MAX_FILE_SIZE_MB=50
FORCE_REINDEX=false
```

## 15. Freshness config

```env
FRESHNESS_USE_EFFECTIVE_DATE=true
FRESHNESS_USE_VERSION=true
FRESHNESS_USE_MODIFIED_DATE=true
FRESHNESS_CONFLICT_THRESHOLD_DAYS=90
```

## 16. Observability config

```env
TRACE_ENABLED=true
TRACE_STORE=mongodb
TRACE_STREAM=sse
METRICS_ENABLED=true
```

## 17. Security config

```env
AUTH_ENABLED=false
JWT_SECRET=change_me
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

For local MVP, auth can be disabled. For production, enable auth before exposing publicly.

## 18. Frontend config

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_TRACE_STREAM_ENABLED=true
VITE_APP_NAME=PolicyBot Intelligence
```
