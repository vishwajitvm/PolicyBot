from app.db.repositories.base_repository import BaseRepository


class EvaluationDatasetRepository(BaseRepository):
    collection_name = "eval_datasets"


class EvaluationRunRepository(BaseRepository):
    collection_name = "eval_runs"
