import { Card } from "../../components/ui/Card";

export function IngestionLogPanel({ logs }: { logs: string[] }) {
  return <Card><h3 className="mb-3 font-semibold">Ingestion Logs</h3><pre className="max-h-72 overflow-auto text-sm text-muted">{logs.join("\n")}</pre></Card>;
}
