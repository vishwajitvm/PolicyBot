# Evaluation and Scoring

**Accuracy checks, relevance scoring, and RAG quality tests**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Why scoring is needed

A RAG system can return fluent but wrong answers. Scoring helps detect weak retrieval, outdated sources, unsupported claims, and answer uncertainty.

## 2. MVP score types

| Score | Range | Meaning |
|---|---:|---|
| Retrieval relevance | 0-1 | How relevant retrieved chunks are |
| Citation coverage | 0-1 | How much of the answer is backed by citations |
| Freshness confidence | 0-1 | Whether selected source appears latest |
| Conflict risk | 0-1 | Whether retrieved documents disagree |
| Answer confidence | 0-1 | Overall confidence based on all signals |

## 3. Retrieval relevance formula

Simple MVP formula:

```text
retrieval_relevance = average(top_5_normalized_vector_scores)
```

Improved formula:

```text
retrieval_relevance =
  0.50 * semantic_similarity +
  0.20 * keyword_overlap +
  0.15 * section_title_match +
  0.15 * reranker_score
```

## 4. Freshness confidence formula

```text
freshness_confidence =
  0.35 * effective_date_score +
  0.25 * version_score +
  0.20 * modified_date_score +
  0.10 * created_date_score +
  0.10 * admin_current_score
```

## 5. Citation coverage formula

```text
citation_coverage = supported_claims / total_claims
```

For MVP, ask the LLM verifier to produce structured output:

```json
{
  "claims": [
    {"claim":"Employees get 26 weeks leave", "supported":true, "citation_id":"c1"}
  ],
  "coverage": 0.92
}
```

## 6. Conflict risk formula

```text
conflict_risk = conflicting_relevant_sources / total_relevant_sources
```

Increase risk when:

- two relevant documents have different dates,
- same policy topic has different numbers/limits,
- older document has strong relevance but newer document exists,
- extracted effective dates disagree.

## 7. Answer confidence formula

```text
answer_confidence =
  0.35 * retrieval_relevance +
  0.25 * citation_coverage +
  0.25 * freshness_confidence +
  0.15 * (1 - conflict_risk)
```

## 8. Evaluation dataset format

```json
{
  "question": "How many maternity leave weeks are allowed?",
  "expected_answer_keywords": ["26 weeks", "maternity leave"],
  "expected_source_files": ["leave_policy_v4.pdf"],
  "must_not_use_files": ["leave_policy_v2.pdf"],
  "category": "leave_policy"
}
```

## 9. Evaluation pass criteria

A question passes if:

- expected source appears in top retrieved documents,
- answer includes expected key facts,
- citation references expected source,
- answer confidence is above threshold,
- no forbidden old source is used as current truth.

## 10. Recommended thresholds

| Metric | MVP threshold |
|---|---:|
| Retrieval relevance | >= 0.70 |
| Citation coverage | >= 0.80 |
| Freshness confidence | >= 0.75 |
| Answer confidence | >= 0.75 |
| Conflict risk | <= 0.35 |

## 11. Evaluation commands

```bash
python -m app.cli.evaluate --dataset ./eval/policy_questions.json
python -m app.cli.evaluate --dataset ./eval/policy_questions.json --limit 20
python -m app.cli.evaluate --compare eval_run_001 eval_run_002
```

## 12. Regression strategy

Before every major model/vector DB change:

1. Run evaluation dataset.
2. Compare pass rate.
3. Compare average latency.
4. Compare retrieval source quality.
5. Compare no-answer rate.
6. Approve only if quality does not drop.
