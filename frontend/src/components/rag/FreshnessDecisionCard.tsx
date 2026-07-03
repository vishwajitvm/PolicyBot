import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function FreshnessDecisionCard({ decision }: { decision: Record<string, unknown> }) {
  const isFresh = decision?.is_fresh ?? decision?.fresh ?? false;
  const explanation = String(decision.explanation ?? "No freshness decision recorded yet.");
  const sources_checked = decision?.sources_checked ?? decision?.sourcesCount ?? 0;
  const sources_fresh = decision?.sources_fresh ?? decision?.freshSources ?? 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text">Freshness Decision</h3>
        <Badge variant={isFresh ? "success" : "destructive"} className="text-xs px-3 py-1">
          {isFresh ? "FRESH" : "STALE"}
        </Badge>
      </div>

      <p className="text-sm text-muted mb-3">{explanation}</p>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Sources Checked:</span>
          <span className="font-mono text-text">{sources_checked}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Fresh Sources:</span>
          <span className="font-mono text-text">{sources_fresh}</span>
        </div>
        {sources_checked > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Freshness Ratio:</span>
            <span className="font-mono text-text">
              {((sources_fresh / sources_checked) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Raw JSON for debugging */}
      <details className="mt-3">
        <summary className="font-medium text-sm text-muted cursor-pointer">
          View Raw Decision Data
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted bg-muted/50 p-3 rounded">
          {JSON.stringify(decision, null, 2)}
        </pre>
      </details>
    </Card>
  );
}
