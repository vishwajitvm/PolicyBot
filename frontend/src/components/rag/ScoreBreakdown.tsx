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
    <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all shadow-lg p-5">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-wide">Score Breakdown</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overall Confidence:</span>
          <span className={`font-bold text-lg ${getScoreVariant(overallScore) === 'success' ? 'text-emerald-400' : getScoreVariant(overallScore) === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
            {(overallScore * 100).toFixed(1)}% <span className="text-xs opacity-80 font-medium">({getScoreLabel(overallScore)})</span>
          </span>
        </div>
        <div className="w-full bg-black/40 rounded-full h-3 mt-3 overflow-hidden shadow-inner border border-white/5">
          <div className={`h-full rounded-full transition-all duration-1000 ${getScoreVariant(overallScore) === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : getScoreVariant(overallScore) === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} style={{ width: `${overallScore * 100}%` }}></div>
        </div>
      </div>

      <div className="grid gap-4 bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
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
      <div className="mt-5 pt-4 border-t border-white/5">
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
          Scores are calculated on a scale of 0-1 (0%-100%), where higher scores indicate better performance.
          The overall confidence is a weighted average of all individual scores.
        </p>
      </div>
    </Card>
  );
}
