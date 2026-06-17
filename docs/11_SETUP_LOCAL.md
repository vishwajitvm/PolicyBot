# Local Setup Guide

**Step-by-step setup for development**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Prerequisites

Install:

- Python 3.11 or 3.12
- Node.js 20+
- Docker Desktop
- Git
- A Gemini API key
- Optional Pinecone API key if using Pinecone

## 2. Clone project

```bash
git clone <your-repo-url> policybot
cd policybot
```

## 3. Create environment file

```bash
cp templates/.env.example .env
```

Update:

```env
GEMINI_API_KEY=your_key
VECTOR_DB_PROVIDER=qdrant
MONGODB_URI=mongodb://mongodb:27017/policybot
QDRANT_URL=http://qdrant:6333
```

## 4. Start infrastructure only

```bash
docker compose up -d mongodb qdrant redis
```

Check services:

```bash
docker compose ps
curl http://localhost:6333/health
```

## 5. Backend setup without Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # mac/linux
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -U pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

## 6. Frontend setup without Docker

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## 7. Full Docker setup

```bash
docker compose up --build
```

Services:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Qdrant | http://localhost:6333 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

## 8. Create DB indexes

```bash
docker compose exec backend python -m app.cli.create_indexes
```

## 9. Run folder ingestion

Put files in:

```text
./data/policies
```

Run:

```bash
docker compose exec backend python -m app.cli.ingest --path /app/data/policies
```

Or call API:

```bash
curl -X POST http://localhost:8000/api/v1/ingestion/sync-folder   -H "Content-Type: application/json"   -d '{"folder_path":"/app/data/policies","recursive":true,"force_reindex":false}'
```

## 10. Ask a question

```bash
curl -X POST http://localhost:8000/api/v1/chat/ask   -H "Content-Type: application/json"   -d '{"question":"What is the latest leave policy?","stream_trace":false}'
```

## 11. Common local issues

### Qdrant collection not found

Run:

```bash
docker compose exec backend python -m app.cli.create_indexes
```

### Gemini rate limit

Reduce batch size:

```env
EMBEDDING_BATCH_SIZE=8
```

### Embedding dimension mismatch

Delete and recreate vector collection after changing embedding dimension.

### Frontend cannot connect backend

Check:

```env
VITE_API_BASE_URL=http://localhost:8000
```
