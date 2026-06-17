import type { Citation } from "../../types/query.types";
import { Card } from "../ui/Card";

export function CitationPanel({ citations }: { citations: Citation[] }) {
  return (
    <Card>
      <h3 className="mb-3 font-semibold">Citations</h3>
      <div className="space-y-3">
        {citations.map((citation) => (
          <div key={citation.chunk_id} className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <strong>{citation.file_name}</strong>
              <span className="text-muted">{Math.round(citation.score * 100)}%</span>
            </div>
            <p className="mt-2 text-sm text-muted">{citation.snippet}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
