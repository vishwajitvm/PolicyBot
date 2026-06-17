import { useMutation } from "@tanstack/react-query";
import { askQuestion } from "../../api/query.api";
import { CitationPanel } from "../../components/rag/CitationPanel";
import { ScoreBreakdown } from "../../components/rag/ScoreBreakdown";
import { Card } from "../../components/ui/Card";
import { useAppStore } from "../../stores/appStore";
import { AnswerCard } from "./AnswerCard";
import { ChatInput } from "./ChatInput";
import { QueryTracePreview } from "./QueryTracePreview";

export function ChatPageFeature() {
  const setLastTraceId = useAppStore((state) => state.setLastTraceId);
  const mutation = useMutation({ mutationFn: (question: string) => askQuestion(question), onSuccess: (data) => setLastTraceId(data.trace_id) });
  const answer = mutation.data;
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card><ChatInput onAsk={(question) => mutation.mutate(question)} pending={mutation.isPending} /></Card>
        {mutation.error ? <Card className="border-red-500 text-red-200">{mutation.error.message}</Card> : null}
        {answer ? <AnswerCard answer={answer} /> : <Card><p className="text-muted">Ask a question to see citations, confidence, retrieval score, freshness score, and the operational RAG trace.</p></Card>}
        {answer ? <CitationPanel citations={answer.citations} /> : null}
      </div>
      <div className="space-y-4">
        {answer ? <ScoreBreakdown scores={answer.scores} /> : null}
        {answer ? <QueryTracePreview traceId={answer.trace_id} /> : null}
      </div>
    </div>
  );
}
