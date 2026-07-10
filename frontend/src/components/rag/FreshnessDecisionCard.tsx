import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function FreshnessDecisionCard({ decision }: { decision: Record<string, unknown> }) {
  const isFresh = decision?.is_fresh ?? decision?.fresh ?? false;
  const explanation = String(decision.explanation ?? "No freshness decision recorded yet.");
  const sources_checked = decision?.sources_checked ?? decision?.sourcesCount ?? 0;
  const sources_fresh = decision?.sources_fresh ?? decision?.freshSources ?? 0;

  return (
    <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all shadow-lg p-5">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white tracking-wide">Freshness Decision</h3>
        <Badge className={`${isFresh ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"} font-mono px-3 py-1`}>
          {isFresh ? "FRESH" : "STALE"}
        </Badge>
      </div>

      <p className="text-sm text-gray-300 mb-6 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">{explanation}</p>

      {/* Details */}
      <div className="space-y-3 mb-6 px-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 font-medium">Sources Checked:</span>
          <span className="font-mono text-white bg-black/30 px-2 py-0.5 rounded">{sources_checked}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 font-medium">Fresh Sources:</span>
          <span className="font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">{sources_fresh}</span>
        </div>
        {sources_checked > 0 && (
          <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400 font-medium tracking-wide">Freshness Ratio:</span>
            <span className="font-mono text-white text-lg font-bold">
              {((sources_fresh / sources_checked) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Raw JSON for debugging */}
      <details className="mt-4 pt-4 border-t border-white/5 group">
        <summary className="font-medium text-[11px] uppercase tracking-wider text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors list-none flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform text-xs">▶</span>
          View Raw Decision Data
        </summary>
        <pre className="mt-3 max-h-40 overflow-y-auto text-xs text-gray-400 font-mono bg-black/40 p-3.5 rounded-lg border border-white/5 shadow-inner">
          {JSON.stringify(decision, null, 2)}
        </pre>
      </details>
    </Card>
  );
}
