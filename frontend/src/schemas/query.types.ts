export interface QueryScores {
  retrieval_relevance?: number;
  answer_confidence?: number;
  citation_coverage?: number;
  freshness_confidence?: number;
  conflict_risk?: number;
  [key: string]: number | undefined;
}
