# Vector Database Strategy

**Pinecone, Qdrant, Chroma, and MongoDB Atlas Vector Search**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Why a vector DB is mandatory

RAG requires semantic retrieval. Semantic retrieval requires storing embeddings and searching nearest neighbors efficiently. MongoDB can store metadata and documents, but a production RAG system needs a vector index layer. This can be a dedicated vector DB like Qdrant or Pinecone, a local vector DB like Chroma, or MongoDB Atlas Vector Search if you want vectors and metadata in one managed platform.

## 2. Recommended provider decision

### Best for your 10-day MVP

Use **Qdrant in Docker** locally. It is free to self-host, easy to run with Docker, and strong enough for a serious MVP.

### Best managed free/low-cost option

Use **Pinecone serverless/free plan** if you want a managed vector DB without operating a local vector service. Check limits before production because free tiers and quotas change.

### Best simplest local prototype

Use **Chroma** if you want the fastest local-only prototype. It is simple but not the first choice for a scalable production path unless you intentionally choose Chroma Cloud/self-hosting.

### Best if you want one managed database

Use **MongoDB Atlas Vector Search** if you want metadata, document records, full-text search, and vector search in the MongoDB ecosystem.

## 3. Provider comparison

| Provider | Good for | Free/low-cost note | Pros | Cons |
|---|---|---|---|---|
| Qdrant | Local dev, self-hosting, scalable vector search | Open-source self-host is free; Qdrant Cloud has free tier limits | Strong filtering, Docker-friendly, production-ready | You manage infra if self-hosting |
| Pinecone | Managed vector DB | Free/serverless quotas available, verify current limits before production | Very low ops, managed scaling, simple cloud path | Free limits may be smaller than self-hosting |
| Chroma | Local prototype, small projects | Open-source local is free; Chroma Cloud has credits/usage billing | Very simple developer experience | For large production, plan carefully |
| MongoDB Atlas Vector Search | Unified MongoDB + vector strategy | Depends on Atlas tier | One DB ecosystem, hybrid full-text/vector | Less portable if you hardcode Atlas-specific search |

## 4. Recommended config strategy

```env
VECTOR_DB_PROVIDER=qdrant
VECTOR_DB_COLLECTION=policybot_chunks
VECTOR_DIMENSION=768
VECTOR_DISTANCE=cosine
VECTOR_TOP_K=30
RERANK_TOP_K=8
```

Supported values:

```env
VECTOR_DB_PROVIDER=qdrant | pinecone | chroma | mongodb_atlas
```

## 5. Vector store adapter interface

```python
class VectorStoreAdapter:
    async def ensure_collection(self) -> None:
        pass

    async def upsert_chunks(self, chunks: list[ChunkRecord]) -> None:
        pass

    async def delete_by_document_id(self, document_id: str) -> None:
        pass

    async def search(self, query_vector: list[float], filters: dict, top_k: int) -> list[RetrievedChunk]:
        pass
```

## 6. Qdrant local setup

Use Qdrant in Docker for development:

```yaml
qdrant:
  image: qdrant/qdrant:latest
  ports:
    - "6333:6333"
    - "6334:6334"
  volumes:
    - qdrant_data:/qdrant/storage
```

Environment:

```env
VECTOR_DB_PROVIDER=qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=policybot_chunks
```

## 7. Pinecone setup

Environment:

```env
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=policybot-chunks
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

Pinecone is ideal when you do not want to maintain vector DB infrastructure. Use it for managed production after the MVP works.

## 8. Chroma setup

Environment:

```env
VECTOR_DB_PROVIDER=chroma
CHROMA_HOST=chroma
CHROMA_PORT=8000
CHROMA_COLLECTION=policybot_chunks
```

Chroma is good for quick local demos, but for a scalable client-facing product Qdrant or Pinecone is usually a cleaner production path.

## 9. MongoDB Atlas Vector Search setup

Environment:

```env
VECTOR_DB_PROVIDER=mongodb_atlas
MONGODB_URI=mongodb+srv://...
MONGODB_VECTOR_COLLECTION=chunk_vectors
MONGODB_VECTOR_INDEX=policybot_vector_index
```

Use this when you want MongoDB to serve as both metadata DB and vector search backend. Keep the adapter interface anyway so you can switch later.

## 10. Metadata payload fields

Every vector record should include:

```json
{
  "organization_id": "org_001",
  "document_id": "doc_001",
  "chunk_id": "chunk_001",
  "file_name": "policy_v4.pdf",
  "file_path": "/policies/policy_v4.pdf",
  "document_title": "Leave Policy",
  "section_title": "Maternity Leave",
  "page_number": 4,
  "created_at": "2026-05-01T00:00:00Z",
  "modified_at": "2026-05-20T00:00:00Z",
  "effective_date": "2026-06-01",
  "version": "v4",
  "content_hash": "sha256...",
  "chunk_index": 12,
  "text_preview": "Employees are eligible..."
}
```

## 11. Index lifecycle rules

- If document content changes, delete old vectors for that document and upsert new chunks.
- If embedding model changes, rebuild the full index.
- If vector dimension changes, create a new collection/index.
- If metadata schema changes, backfill vector payloads.
- If a file is deleted from source folder, mark document deleted and remove vectors.

## 12. Final recommendation

For your current project:

```text
Development: Qdrant in Docker
Demo/managed MVP: Pinecone serverless/free plan if limits fit
Production/self-hosted: Qdrant Cloud/self-hosted cluster
Production/MongoDB-centric: MongoDB Atlas Vector Search
```

Do not lock yourself to one vendor. Build the adapter first.
