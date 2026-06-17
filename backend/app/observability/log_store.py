import json
from datetime import datetime
from pathlib import Path


class LogStore:
    def __init__(self, file_path: str):
        self.path = Path(file_path)

    def list_logs(
        self,
        level: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        search: str | None = None,
        limit: int = 500,
    ) -> list[dict]:
        if not self.path.exists():
            return []
        rows: list[dict] = []
        with self.path.open("r", encoding="utf-8", errors="ignore") as handle:
            for line in handle:
                try:
                    item = json.loads(line)
                except json.JSONDecodeError:
                    continue
                timestamp = self._parse_timestamp(item.get("timestamp"))
                if level and item.get("level", "").upper() != level.upper():
                    continue
                if start_date and timestamp and timestamp < start_date:
                    continue
                if end_date and timestamp and timestamp > end_date:
                    continue
                if search and search.lower() not in json.dumps(item).lower():
                    continue
                rows.append(item)
        return list(reversed(rows[-limit:]))

    def stats(self) -> dict:
        if not self.path.exists():
            return {"size_bytes": 0, "path": str(self.path), "count": 0}
        count = 0
        with self.path.open("r", encoding="utf-8", errors="ignore") as handle:
            for _ in handle:
                count += 1
        return {"size_bytes": self.path.stat().st_size, "path": str(self.path), "count": count}

    def _parse_timestamp(self, value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return None
