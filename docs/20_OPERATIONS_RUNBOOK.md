# Operations Runbook

**Maintenance, re-indexing, troubleshooting, backup, and recovery**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Daily checks

- Check API health.
- Check worker health.
- Check ingestion failures.
- Check vector DB collection status.
- Check MongoDB storage usage.
- Review low-confidence answers.

## 2. Re-index one document

```bash
python -m app.cli.ingest --file /app/data/policies/leave_policy_v4.pdf --force
```

Or API:

```bash
curl -X POST http://localhost:8000/api/v1/documents/doc_001/reindex
```

## 3. Re-index full folder

```bash
python -m app.cli.ingest --path /app/data/policies --force
```

Use full re-index when:

- embedding model changed,
- vector dimension changed,
- chunking logic changed,
- metadata schema changed,
- vector DB provider changed.

## 4. Clear local vector DB

For local Qdrant:

```bash
docker compose down
docker volume rm policybot_qdrant_data
docker compose up -d qdrant
python -m app.cli.create_indexes
python -m app.cli.ingest --path /app/data/policies --force
```

## 5. Backup plan

Backup:

- MongoDB database,
- original documents,
- vector DB snapshots if provider supports it,
- evaluation datasets,
- `.env` stored securely outside Git.

## 6. Common incidents

### Incident: Chat returns weak answers

Check:

- retrieved chunks,
- vector DB provider health,
- embedding model/dimension,
- chunking output,
- freshness resolver logic,
- evaluation regression.

### Incident: Latest document not selected

Check:

- effective date extracted,
- version extraction,
- file modified date,
- document `latest_detected` field,
- freshness score payload.

### Incident: Ingestion stuck

Check:

```bash
docker compose logs -f worker
docker compose exec redis redis-cli LLEN policybot-jobs
```

### Incident: Vector DB search fails

Check:

- Qdrant/Pinecone credentials,
- collection/index exists,
- vector dimension matches,
- network connectivity,
- provider quota.

## 7. Release process

1. Run tests.
2. Run evaluation dataset.
3. Build Docker images.
4. Deploy backend and worker.
5. Run health check.
6. Run sample question.
7. Monitor logs.

## 8. Maintenance schedule

| Frequency | Task |
|---|---|
| Daily | Check failed ingestion jobs |
| Weekly | Review low-confidence answers |
| Weekly | Run evaluation dataset |
| Monthly | Backup review |
| Monthly | Dependency updates |
| Before demo | Full ingestion + evaluation |
