class AccuracyService:
    def score(self, results: list[dict]) -> dict:
        if not results:
            return {"accuracy": 0.0, "passed": 0, "failed": 0}
        passed = sum(1 for item in results if item.get("passed"))
        return {"accuracy": passed / len(results), "passed": passed, "failed": len(results) - passed}
