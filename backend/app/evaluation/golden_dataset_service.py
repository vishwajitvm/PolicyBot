from uuid import uuid4


class GoldenDatasetService:
    def create_dataset(self, name: str, items: list[dict]) -> dict:
        return {"dataset_id": str(uuid4()), "name": name, "items": items}
