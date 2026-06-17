# Commands Cheat Sheet

**Common setup, Docker, backend, frontend, ingestion, DB, and deployment commands**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Docker commands

```bash
docker compose up --build
docker compose up -d --build
docker compose down
docker compose down -v
docker compose ps
docker compose logs -f backend
docker compose logs -f worker
```

## 2. Backend commands

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend commands

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

## 4. DB/index commands

```bash
python -m app.cli.create_indexes
python -m app.cli.db_status
python -m app.cli.vector_status
```

## 5. Ingestion commands

```bash
python -m app.cli.ingest --path ./data/policies
python -m app.cli.ingest --path ./data/policies --force
python -m app.cli.ingest --file ./data/policies/leave_policy_v4.pdf --force
```

Docker:

```bash
docker compose exec backend python -m app.cli.ingest --path /app/data/policies
docker compose exec backend python -m app.cli.ingest --path /app/data/policies --force
```

## 6. Evaluation commands

```bash
python -m app.cli.evaluate --dataset ./eval/policy_questions.json
python -m app.cli.evaluate --dataset ./eval/policy_questions.json --limit 10
python -m app.cli.evaluate --compare eval_run_001 eval_run_002
```

## 7. API commands

Health:

```bash
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/health/ready
```

Ask:

```bash
curl -X POST http://localhost:8000/api/v1/chat/ask   -H "Content-Type: application/json"   -d '{"question":"What is the latest leave policy?"}'
```

Ingest:

```bash
curl -X POST http://localhost:8000/api/v1/ingestion/sync-folder   -H "Content-Type: application/json"   -d '{"folder_path":"/app/data/policies","recursive":true}'
```

## 8. Qdrant commands

```bash
curl http://localhost:6333/health
curl http://localhost:6333/collections
```

## 9. MongoDB commands

```bash
docker compose exec mongodb mongosh
docker compose exec mongodb mongosh --eval "show dbs"
docker compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

## 10. Makefile commands

```bash
make up
make down
make logs
make backend
make frontend
make ingest
make test
make eval
```
