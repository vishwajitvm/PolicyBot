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
    <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/10 transition-all shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 p-5">
          {/* Badge with score */}
          <div className="flex-shrink-0 mt-0.5">
            <Badge className={`${score >= 0.8 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : score >= 0.6 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"} font-mono`}>
              {score.toFixed(3)}
            </Badge>
          </div>

          {/* Chunk details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white truncate pr-2">
                Chunk {chunkId.slice(0, 8)}
              </h4>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold truncate max-w-[120px]">{String(source).split('/').pop()}</span>
                {page !== undefined && (
                  <span className="text-[10px] text-gray-500 font-medium">p. {page}</span>
                )}
              </div>
            </div>

            {/* Content with expand/collapse */}
            <div className="max-h-[160px] overflow-y-auto text-xs text-gray-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 shadow-inner">
              {truncateText(text, 600)}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="mt-auto flex items-center justify-between px-5 py-3 border-t border-white/5 bg-black/20">
          <button
            onClick={() => {
              alert("Full chunk text:\n\n" + text);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View Full Text
          </button>
          <span className="text-[10px] font-mono text-gray-500 tracking-wider">
            {text.length} chars
          </span>
        </div>
      </div>
    </Card>
  );
}
