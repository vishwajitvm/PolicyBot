from datetime import datetime


def log_event(step: str, status: str, input_summary: dict | None = None, output_summary: dict | None = None, latency_ms: int = 0) -> dict:
    return {
        "step": step,
        "status": status,
        "input_summary": input_summary or {},
        "output_summary": output_summary or {},
        "latency_ms": latency_ms,
        "timestamp": datetime.utcnow(),
    }
