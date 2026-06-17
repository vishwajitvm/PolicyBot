import type { QueryScores } from "../../types/query.types";
import { Card } from "../ui/Card";
import { ScoreMeter } from "../ui/ScoreMeter";

export function ScoreBreakdown({ scores }: { scores: Partial<QueryScores> }) {
  return (
    <Card className="space-y-4">
      <h3 className="font-semibold">Score Breakdown</h3>
      <ScoreMeter label="Answer confidence" value={scores.answer_confidence} />
      <ScoreMeter label="Retrieval score" value={scores.retrieval_score} />
      <ScoreMeter label="Freshness score" value={scores.freshness_score} />
      <ScoreMeter label="Context relevance" value={scores.context_relevance_score} />
      <ScoreMeter label="Citation quality" value={scores.citation_quality_score} />
    </Card>
  );
}
