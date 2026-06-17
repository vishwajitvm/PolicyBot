import { Card } from "../ui/Card";

export function RetrievedChunkCard({ chunk }: { chunk: Record<string, unknown> }) {
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between text-sm">
        <strong>{String(chunk.chunk_id ?? "chunk")}</strong>
        <span className="text-muted">{String(chunk.score ?? "")}</span>
      </div>
      <p className="text-sm text-muted">{String(chunk.text ?? "").slice(0, 360)}</p>
    </Card>
  );
}
