import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any


class JsonLineLogHandler(logging.Handler):
    def __init__(self, file_path: str, max_bytes: int):
        super().__init__()
        self.path = Path(file_path)
        self.max_bytes = max_bytes
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self._cleanup_if_needed()
            payload: dict[str, Any] = {
                "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "module": record.module,
                "function": record.funcName,
                "line": record.lineno,
            }
            if record.exc_info:
                payload["exception"] = self.formatException(record.exc_info)
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(payload, default=str) + "\n")
        except Exception:
            self.handleError(record)

    def _cleanup_if_needed(self) -> None:
        if not self.path.exists() or self.path.stat().st_size <= self.max_bytes:
            return
        archived = self.path.with_name(f"{self.path.stem}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{self.path.suffix}")
        self.path.replace(archived)
        archives = sorted(
            self.path.parent.glob(f"{self.path.stem}-*{self.path.suffix}"),
            key=lambda item: item.stat().st_mtime,
        )
        while sum(item.stat().st_size for item in archives) > self.max_bytes and archives:
            oldest = archives.pop(0)
            oldest.unlink(missing_ok=True)


def configure_logging(level: str, log_file_path: str = "logs/policybot.jsonl", max_bytes: int = 10 * 1024 * 1024) -> None:
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    file_handler = JsonLineLogHandler(log_file_path, max_bytes)
    file_handler.setFormatter(formatter)
    root.handlers.clear()
    root.addHandler(console)
    root.addHandler(file_handler)
