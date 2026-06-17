import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listLogs } from "../api/logs.api";
import { PageShell } from "../components/layout/PageShell";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export function LogsPage() {
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const filters = {
    level,
    search,
    start_date: startDate ? new Date(startDate).toISOString() : "",
    end_date: endDate ? new Date(endDate).toISOString() : ""
  };
  const { data, error, refetch } = useQuery({ queryKey: ["logs", filters], queryFn: () => listLogs(filters), retry: false, refetchInterval: 10000 });

  return (
    <PageShell title="Logs">
      <div className="space-y-4">
        <Card>
          <div className="grid gap-3 md:grid-cols-5">
            <Select value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="">All levels</option>
              <option value="INFO">Info</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="DEBUG">Debug</option>
            </Select>
            <Input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search message, logger, module" />
            <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white" onClick={() => refetch()}>Refresh</button>
          </div>
          <p className="mt-3 text-sm text-muted">
            {data ? `${data.stats.count} events · ${data.stats.size_bytes} bytes · ${data.stats.path}` : "Loading logs..."}
          </p>
        </Card>
        {error ? <Card className="border-red-500 text-red-200">{error.message}</Card> : null}
        <div className="space-y-3">
          {(data?.items ?? []).map((item, index) => (
            <Card key={`${item.timestamp}-${index}`}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                <strong className="text-text">{item.level}</strong>
                <span>{item.timestamp}</span>
                <span>{item.logger}</span>
                <span>{item.module}:{item.line}</span>
              </div>
              <p className="mt-2 text-sm text-text">{item.message}</p>
              {item.exception ? <pre className="mt-2 max-h-60 overflow-auto text-xs text-red-200">{item.exception}</pre> : null}
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
