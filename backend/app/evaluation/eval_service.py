import json
from uuid import uuid4
from datetime import datetime, timezone

from tracenest import logger
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.evaluation.accuracy_service import AccuracyService
from app.providers.base_llm import BaseLLMProvider
from app.rag.rag_graph import RAGGraph


class EvaluationService:
    def __init__(self, db: AsyncIOMotorDatabase, llm: BaseLLMProvider, rag_graph: RAGGraph):
        self.db = db
        self.llm = llm
        self.rag_graph = rag_graph
        self.accuracy = AccuracyService()

    async def run(self, dataset_id: str) -> dict:
        dataset = await self.db["eval_datasets"].find_one({"dataset_id": dataset_id}, {"_id": 0})
        items = (dataset or {}).get("items", [])
        details = []
        
        for item in items:
            if isinstance(item, str):
                item = {"question": item, "expected_answer": ""}
                
            question = item.get("question", "")
            expected = item.get("expected_answer", "")
            
            # 1. Get Generated Answer
            try:
                rag_response = await self.rag_graph.run(question)
                generated = rag_response.answer
            except Exception as e:
                logger.error(f"Error running RAG for evaluation: {e}")
                generated = "Error generating answer from RAG pipeline."

            # 2. Grade with LLM Judge
            prompt = f"""You are an expert AI judge evaluating a Q&A system.
Determine if the GENERATED ANSWER is correct based on the EXPECTED ANSWER.
It doesn't have to be identical, just semantically correct and containing the expected information.

QUESTION: {question}
EXPECTED ANSWER: {expected}
GENERATED ANSWER: {generated}

Respond ONLY with a valid JSON object matching this schema. Do not include markdown formatting:
{{
  "passed": boolean,
  "reason": "A short, 1-2 sentence explanation of why it passed or failed."
}}
"""
            try:
                judge_res = await self.llm.generate(prompt, temperature=0.1)
                raw = judge_res.text.strip()
                if raw.startswith("```json"):
                    raw = raw[7:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                parsed = json.loads(raw.strip())
                passed = bool(parsed.get("passed", False))
                reason = str(parsed.get("reason", "Unknown reason"))
            except Exception as e:
                logger.error(f"Error running LLM Judge: {e}")
                passed = False
                reason = "AI Judge failed to evaluate or return valid JSON."

            item_dict = {"question": question, "expected_answer": expected, "generated_answer": generated}
            details.append({"item": item_dict, "passed": passed, "reason": reason})

        score = self.accuracy.score(details)
        run = {
            "run_id": str(uuid4()), 
            "dataset_id": dataset_id, 
            "created_at": datetime.now(timezone.utc).isoformat(),
            **score, 
            "details": details
        }
        await self.db["eval_runs"].insert_one(run.copy())
        return run
