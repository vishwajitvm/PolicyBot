import { Card } from "../ui/Card";

export function FreshnessDecisionCard({ decision }: { decision: Record<string, unknown> }) {
  return (
    <Card>
      <h3 className="mb-2 font-semibold">Freshness Decision</h3>
      <p className="text-sm text-muted">{String(decision.explanation ?? "No freshness decision recorded yet.")}</p>
      <pre className="mt-3 max-h-40 overflow-auto text-xs text-muted">{JSON.stringify(decision, null, 2)}</pre>
    </Card>
  );
}
