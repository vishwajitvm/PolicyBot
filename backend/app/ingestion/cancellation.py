import asyncio

_cancellation_events: dict[str, asyncio.Event] = {}

def get_cancellation_event(job_id: str) -> asyncio.Event:
    """Gets or creates a cancellation event for a specific job."""
    if job_id not in _cancellation_events:
        _cancellation_events[job_id] = asyncio.Event()
    return _cancellation_events[job_id]

def init_cancellation_event(job_id: str) -> None:
    """Pre-initializes the cancellation event for a new job."""
    if job_id not in _cancellation_events:
        _cancellation_events[job_id] = asyncio.Event()

def cancel_job(job_id: str) -> bool:
    """Sets the cancellation flag for a job. Initializes it if it doesn't exist to ensure early cancellation works."""
    event = get_cancellation_event(job_id)
    event.set()
    return True

def clear_cancellation_event(job_id: str):
    """Removes the cancellation event from memory."""
    _cancellation_events.pop(job_id, None)
