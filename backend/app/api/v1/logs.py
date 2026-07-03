from tracenest import logger
from datetime import datetime

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.observability.log_store import LogStore
from app.schemas.common import ApiResponse


router = APIRouter(prefix="/logs")


@router.get("", response_model=ApiResponse)
async def list_logs(
    request: Request,
    level: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    search: str | None = None,
    limit: int = 500,
) -> ApiResponse:
    try:
        store = LogStore(request.app.state.settings.log_file_path)
        return ApiResponse(
            data={"items": store.list_logs(level, start_date, end_date, search, limit), "stats": store.stats()},
            message="Logs retrieved"
        )
    except Exception as exc:
        logger.exception("Failed to list logs")
        return ApiResponse(success=False, message=str(exc))


@router.get("/ui", response_class=HTMLResponse)
async def logs_ui() -> str:
    try:
        return """
<!doctype html>
<html>
<head>
  <title>PolicyBot Logs</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0d1117; color: #e6edf3; }
    header, main { padding: 16px; }
    header { border-bottom: 1px solid #30363d; background: #161b22; }
    input, select, button { background: #0d1117; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; padding: 8px; }
    button { background: #238636; cursor: pointer; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .log { border: 1px solid #30363d; border-radius: 6px; padding: 12px; margin-bottom: 10px; background: #161b22; }
    .meta { color: #8b949e; font-size: 12px; display: flex; gap: 12px; flex-wrap: wrap; }
    pre { white-space: pre-wrap; word-break: break-word; color: #c9d1d9; }
  </style>
</head>
<body>
  <header><h1>PolicyBot Logs</h1><p id="stats"></p></header>
  <main>
    <div class="filters">
      <select id="level"><option value="">All levels</option><option>INFO</option><option>ERROR</option><option>WARNING</option><option>DEBUG</option></select>
      <input id="start" type="datetime-local" />
      <input id="end" type="datetime-local" />
      <input id="search" placeholder="Search logs" />
      <button onclick="loadLogs()">Filter</button>
    </div>
    <div id="logs"></div>
  </main>
  <script>
    async function loadLogs() {
      const params = new URLSearchParams();
      for (const [id, key] of [["level","level"],["search","search"]]) {
        const value = document.getElementById(id).value;
        if (value) params.set(key, value);
      }
      const start = document.getElementById("start").value;
      const end = document.getElementById("end").value;
      if (start) params.set("start_date", new Date(start).toISOString());
      if (end) params.set("end_date", new Date(end).toISOString());
      const res = await fetch(`/api/v1/logs?${params}`);
      const json = await res.json();
      document.getElementById("stats").textContent = `${json.data.stats.count} events · ${json.data.stats.size_bytes} bytes · ${json.data.stats.path}`;
      document.getElementById("logs").innerHTML = json.data.items.map(item => `
        <section class="log">
          <div class="meta"><strong>${item.level}</strong><span>${item.timestamp}</span><span>${item.logger}</span><span>${item.module}:${item.line}</span></div>
          <pre>${item.message}${item.exception ? "\\n" + item.exception : ""}</pre>
        </section>
      `).join("");
    }
    loadLogs();
    setInterval(loadLogs, 10000);
  </script>
</body>
</html>
"""
    except Exception as exc:
        logger.exception("Failed to serve logs UI")
        # In case of error, we still return an HTML response with an error message?
        # But the return type is HTMLResponse, so we must return a string.
        return f"""
<!doctype html>
<html>
<head>
  <title>Error</title>
</head>
<body>
  <h1>Error loading logs UI</h1>
  <p>{exc}</p>
</body>
</html>
"""
