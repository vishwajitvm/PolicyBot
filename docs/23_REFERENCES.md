# References

**External references used for architecture decisions**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Vector database references

- Pinecone pricing and free/serverless limits: https://www.pinecone.io/pricing/
- Qdrant pricing and free tier: https://qdrant.tech/pricing/
- Chroma pricing and cloud credits: https://www.trychroma.com/pricing
- MongoDB Atlas Vector Search with LangChain: https://docs.langchain.com/oss/python/integrations/vectorstores/mongodb_atlas

## 2. LangChain and LangGraph references

- LangChain vector store interface: https://docs.langchain.com/oss/python/integrations/vectorstores
- LangChain Pinecone integration: https://docs.langchain.com/oss/python/integrations/vectorstores/pinecone
- LangChain Qdrant integration: https://docs.langchain.com/oss/python/integrations/vectorstores/qdrant
- LangChain Chroma integration: https://docs.langchain.com/oss/python/integrations/vectorstores/chroma
- LangGraph persistence/checkpointing: https://docs.langchain.com/oss/python/langgraph/persistence

## 3. Gemini references

- Gemini embeddings: https://ai.google.dev/gemini-api/docs/embeddings
- Gemini models: https://ai.google.dev/gemini-api/docs/models
- Gemini changelog/model lifecycle notes: https://ai.google.dev/gemini-api/docs/changelog

## 4. FastAPI references

- FastAPI Docker deployment: https://fastapi.tiangolo.com/deployment/docker/
- FastAPI deployment concepts: https://fastapi.tiangolo.com/deployment/concepts/

## 5. Important current notes

- Gemini `text-embedding-004` has been shut down according to the Gemini API changelog, so this architecture uses Gemini's current embedding model path instead of older embedding model names.
- Free tiers and quotas can change. Before production, verify provider limits directly from official pricing pages.
- The architecture intentionally uses adapters so provider changes do not require rewriting the entire RAG workflow.
