import type { QueryScores } from "../../types/query.types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ScoreMeter } from "../ui/ScoreMeter";

function getScoreLabel(score: number | undefined): string {
  if (score === undefined) return "N/A";
  const percent = Math.round(score * 100);
  if (percent >= 90) return "Excellent";
  if (percent >= 80) return "Good";
  if (percent >= 70) return "Fair";
  if (percent >= 60) return "Moderate";
  return "Poor";
}

function getScoreVariant(score: number | undefined): "success" | "warning" | "destructive" {
  if (score === undefined) return "secondary";
  const percent = score * 100;
  if (percent >= 80) return "success";
  if (percent >= 60) return "warning";
  return "destructive";
}

export function ScoreBreakdown({ scores }: { scores: Partial<QueryScores> }) {
  // Calculate overall confidence as weighted average
  const weights: Record<keyof QueryScores, number> = {
    answer_confidence: 0.3,
    retrieval_score: 0.25,
    freshness_score: 0.15,
    context_relevance_score: 0.2,
    citation_quality_score: 0.1
  };

  let weightedSum = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(key => {
    const value = scores[key];
    if (value !== undefined) {
      weightedSum += value * weights[key as keyof QueryScores];
      totalWeight += weights[key as keyof QueryScores];
    }
  });

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return (
    <Card className="space-y-5">
      <div className="mb-4">
        <h3 className="font-semibold text-text">Score Breakdown</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-muted">Overall Confidence:</span>
          <span className={`font-bold text-text ${getScoreVariant(overallScore)}`}>
            {(overallScore * 100).toFixed(1)}% ({getScoreLabel(overallScore)})
          </span>
        </div>
        <div className="w-full bg-muted/50 rounded-md h-2.5 mt-1">
          <div className={`bg-primary h-2.5 rounded-md`} style={{ width: `${overallScore * 100}%` }}></div>
        </div>
      </div>

      <div className="grid gap-3">
        <ScoreMeter
          label="Answer Confidence"
          value={scores.answer_confidence}
          helpText="How confident the system is in the generated answer"
        />
        <ScoreMeter
          label="Retrieval Score"
          value={scores.retrieval_score}
          helpText="Relevance of retrieved documents to the query"
        />
        <ScoreMeter
          label="Freshness Score"
          value={scores.freshness_score}
          helpText="How current/up-to-date the information is"
        />
        <ScoreMeter
          label="Context Relevance"
          value={scores.context_relevance_score}
          helpText="Relevance of retrieved context to the question"
        />
        <ScoreMeter
          label="Citation Quality"
          value={scores.citation_quality_score}
          helpText="Quality and support of citations for the answer"
        />
      </div>

      {/* Explanation section */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-sm text-muted">
          Scores are calculated on a scale of 0-1 (0%-100%), where higher scores indicate better performance.
          The overall confidence is a weighted average of all individual scores.
        </p>
      </div>
    </Card>
  );
}
