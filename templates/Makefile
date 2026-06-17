up:
	docker compose -f templates/docker-compose.yml up --build

up-d:
	docker compose -f templates/docker-compose.yml up -d --build

down:
	docker compose -f templates/docker-compose.yml down

logs:
	docker compose -f templates/docker-compose.yml logs -f

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

indexes:
	docker compose -f templates/docker-compose.yml exec backend python -m app.cli.create_indexes

ingest:
	docker compose -f templates/docker-compose.yml exec backend python -m app.cli.ingest --path /app/data/policies

test:
	cd backend && pytest -q

eval:
	docker compose -f templates/docker-compose.yml exec backend python -m app.cli.evaluate --dataset /app/eval/policy_questions.json
