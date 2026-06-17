from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.evaluation.accuracy_service import AccuracyService


class EvaluationService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.accuracy = AccuracyService()

    async def run(self, dataset_id: str) -> dict:
        dataset = await self.db["eval_datasets"].find_one({"dataset_id": dataset_id}, {"_id": 0})
        items = (dataset or {}).get("items", [])
        details = [{"item": item, "passed": False, "reason": "Evaluation runner scaffolded; no judge provider configured"} for item in items]
        score = self.accuracy.score(details)
        run = {"run_id": str(uuid4()), "dataset_id": dataset_id, **score, "details": details}
        await self.db["eval_runs"].insert_one(run)
        return run
