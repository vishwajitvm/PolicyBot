import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { formatDate, formatTime } from "../../../features/chat/ChatPage";

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function RetrievedChunkCard({ chunk }: { chunk: Record<string, unknown> }) {
  const chunkId = String(chunk.chunk_id ?? "unknown");
  const score = Number(chunk.score ?? 0);
  const text = String(chunk.text ?? "");
  const metadata = chunk.metadata ?? {};
  const source = metadata?.source ?? metadata?.filename ?? "Unknown source";
  const page = metadata?.page ?? metadata?.page_number ?? undefined;

  return (
    <Card className="border hover:border-primary/20 transition-border">
      <div className="flex items-start gap-4 p-4">
        {/* Badge with score */}
        <div className="flex-shrink-0 mt-0.5">
          <Badge variant={score >= 0.8 ? "success" : score >= 0.6 ? "warning" : "destructive">
            {score.toFixed(3)}
          </Badge>
        </div>

        {/* Chunk details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-text truncate max-w-[200px]">
              Chunk: {chunkId.slice(0, 8)}...
            </h4>
            <span className="text-xs text-muted">{source}</span>
            {page !== undefined && (
              <span className="text-xs text-muted ml-2">p. {page}</span>
            )}
          </div>

          {/* Content with expand/collapse */}
          <div className="max-h-[200px] overflow-y-auto text-sm text-muted leading-relaxed">
            {truncateText(text, 500)}
          </div>

          {/* Metadata */}
          {Object.keys(metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="font-medium text-sm mb-1">Metadata:</p>
              <div className="text-xs text-muted space-y-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{String(key)}:</span>
                    <span className="truncate max-w-[200px]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-between p-3 pt-0 border-t border-border/50">
        <button
          onClick={() => {
            // In a real app, this might open a modal with full text
            alert("Full chunk text:\n\n" + text);
          }}
          className="text-xs text-primary hover:text-primary/80 hover:underline"
        >
          View Full
        </button>
        <span className="text-xs text-muted">
          {text.length} chars
        </span>
      </div>
    </Card>
  );
}
