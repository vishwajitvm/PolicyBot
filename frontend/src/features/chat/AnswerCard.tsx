import type { QueryResponse } from "../../types/query.types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatLatency } from "../../utils/format";

export function AnswerCard({ answer }: { answer: QueryResponse }) {
  return (
    <Card>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge>{answer.model}</Badge>
        <Badge>{answer.vector_db}</Badge>
        <Badge>{formatLatency(answer.latency_ms)}</Badge>
      </div>
      <p className="whitespace-pre-wrap leading-7">{answer.answer}</p>
    </Card>
  );
}
