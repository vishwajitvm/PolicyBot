# Deployment Guide

**From local MVP to production deployment**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Deployment stages

### Stage 1: Local development

- Docker Compose.
- Local MongoDB.
- Local Qdrant.
- Local Redis.
- Gemini API.

### Stage 2: Demo deployment

- Backend and frontend on a VPS or container platform.
- Managed MongoDB Atlas.
- Qdrant Cloud or Pinecone.
- Redis managed or container.
- HTTPS enabled.

### Stage 3: Production deployment

- Container registry.
- CI/CD pipeline.
- Managed MongoDB.
- Managed vector DB.
- Secret manager.
- Central logging.
- Monitoring and alerts.
- Backups.

## 2. Recommended demo deployment

For fastest client demo:

| Component | Deployment |
|---|---|
| Frontend | Vercel/Netlify or container |
| Backend | Render/Fly.io/Railway/VPS/container platform |
| MongoDB | MongoDB Atlas |
| Vector DB | Pinecone or Qdrant Cloud |
| Redis | Managed Redis or container |
| Files | Mounted volume or object storage |

## 3. Recommended production deployment

| Component | Deployment |
|---|---|
| Frontend | CDN/static hosting |
| Backend | Docker container behind load balancer |
| Worker | Separate worker deployment |
| MongoDB | Atlas cluster with backups |
| Vector DB | Pinecone/Qdrant managed cluster |
| Redis | Managed Redis |
| Object storage | S3/GCS/Azure Blob |
| Secrets | Cloud secrets manager |

## 4. Build images

Backend:

```bash
docker build -f templates/Dockerfile.backend -t policybot-backend:latest .
```

Frontend:

```bash
docker build -f templates/Dockerfile.frontend -t policybot-frontend:latest .
```

## 5. Push images

```bash
docker tag policybot-backend:latest registry.example.com/policybot-backend:latest
docker push registry.example.com/policybot-backend:latest
```

## 6. Environment variables in production

Production must set:

```env
APP_ENV=production
AUTH_ENABLED=true
MONGODB_URI=mongodb+srv://...
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=...
GEMINI_API_KEY=...
JWT_SECRET=strong_secret
CORS_ORIGINS=https://your-frontend-domain.com
```

## 7. Deployment checklist

Before production release:

- [ ] Auth enabled.
- [ ] HTTPS enabled.
- [ ] Secrets stored securely.
- [ ] MongoDB indexes created.
- [ ] Vector index created with correct dimension.
- [ ] Backup policy configured.
- [ ] Logs and traces enabled.
- [ ] Rate limits enabled.
- [ ] Evaluation test set passes.
- [ ] Error monitoring enabled.

## 8. Rollback plan

- Keep last working backend image tag.
- Keep vector index version names.
- Do not delete old index until new index passes evaluation.
- Keep MongoDB backup before schema migration.
- Use feature flags for new retriever/scorer logic.

## 9. Scaling plan

### API scaling

Scale backend horizontally because chat requests are stateless except MongoDB/trace records.

### Worker scaling

Scale workers based on ingestion queue length. Embedding API rate limits may become the bottleneck.

### Vector DB scaling

Move from local Qdrant to managed Qdrant/Pinecone when:

- query latency increases,
- vector count grows significantly,
- uptime matters,
- multiple users depend on the product.

### MongoDB scaling

Move to Atlas with indexes and backups before client production.
