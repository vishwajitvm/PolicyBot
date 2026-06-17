# Docker Guide

**Docker Compose setup, service responsibilities, and commands**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Why Docker is important

Docker makes the project reproducible. Without Docker, every developer may run different MongoDB, Qdrant, Redis, Python, and Node versions. Docker Compose gives you one command to start the full system.

## 2. Services in Docker Compose

| Service | Purpose |
|---|---|
| `backend` | FastAPI API server |
| `worker` | Background ingestion/evaluation jobs |
| `frontend` | React + Tailwind frontend |
| `mongodb` | Metadata and trace database |
| `qdrant` | Local vector database |
| `redis` | Queue/cache |
| `nginx` | Optional reverse proxy for production-style local setup |

## 3. Basic commands

### Start all services

```bash
docker compose up --build
```

### Start in background

```bash
docker compose up -d --build
```

### Stop services

```bash
docker compose down
```

### Stop and remove volumes

```bash
docker compose down -v
```

### View logs

```bash
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f qdrant
```

### Run backend shell

```bash
docker compose exec backend bash
```

### Run ingestion command

```bash
docker compose exec backend python -m app.cli.ingest --path /app/data/policies
```

## 4. Docker Compose architecture

```text
frontend → backend → mongodb
                 → qdrant
                 → redis → worker
                 → gemini api
```

## 5. Volumes

Use named volumes:

```yaml
volumes:
  mongo_data:
  qdrant_data:
  redis_data:
```

Use bind mount for documents:

```yaml
./data/policies:/app/data/policies
```

## 6. Environment files

Use:

```yaml
env_file:
  - .env
```

Never bake API keys into Docker images.

## 7. Production Docker notes

For production:

- use multi-stage frontend build,
- use non-root backend user,
- do not mount source code into containers,
- use managed MongoDB/vector DB where possible,
- use secrets manager instead of plain `.env`,
- use HTTPS at reverse proxy/load balancer,
- use readiness/liveness checks.

## 8. Health checks

Backend should expose:

```text
GET /api/v1/health
GET /api/v1/health/ready
```

Qdrant health:

```bash
curl http://localhost:6333/health
```

MongoDB health:

```bash
docker compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

## 9. Included templates

See:

- `templates/docker-compose.yml`
- `templates/Dockerfile.backend`
- `templates/Dockerfile.frontend`
- `templates/nginx.conf`
- `templates/Makefile`
