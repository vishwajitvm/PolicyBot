import { Code, Terminal, Clock, Cpu, GitMerge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTrace } from "../../api/traces.api";
import { TraceTimeline } from "../../components/rag/TraceTimeline";
import { RetrievedChunkCard } from "../../components/rag/RetrievedChunkCard";
import { FreshnessDecisionCard } from "../../components/rag/FreshnessDecisionCard";
import { ScoreBreakdown } from "../../components/rag/ScoreBreakdown";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";

interface JudgeTraceModalProps {
  open: boolean;
  onClose: () => void;
  trace: {
    model: string;
    latency_ms: number;
    prompt: string;
    raw_response: string;
    rag_trace_id?: string;
  } | null;
}

export function JudgeTraceModal({ open, onClose, trace }: JudgeTraceModalProps) {
  const { data: ragTrace, isLoading } = useQuery({
    queryKey: ["trace", trace?.rag_trace_id],
    queryFn: () => getTrace(trace!.rag_trace_id!),
    enabled: Boolean(trace?.rag_trace_id),
    retry: false
  });

  return (
    <Modal open={open} onClose={onClose} className="w-[95%] max-w-6xl h-[85vh] max-h-[85vh]">
      <div className="px-6 py-4 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
              <Code className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Execution Trace Details</h2>
              <p className="text-sm text-slate-400">Audit the end-to-end RAG pipeline and AI Judge execution.</p>
            </div>
          </div>
        </div>

        <div className="space-y-12 pb-6">
          {/* STEP 1: RAG Pipeline Trace */}
          {trace?.rag_trace_id && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <GitMerge className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Step 1: RAG Pipeline Execution</h3>
              </div>
              
              {isLoading ? (
                <div className="py-12 text-center">
                  <Spinner className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="text-slate-400 mt-4 text-sm">Fetching operational trace...</p>
                </div>
              ) : ragTrace ? (
                <div className="gap-8 space-y-8">
                  {/* Operational Trace Section */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Operational Trace</h3>
                      <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                        {ragTrace?.events?.length ?? 0} steps
                      </span>
                    </div>
                    <TraceTimeline events={ragTrace?.events || []} />
                  </div>

                  {/* Retrieved Chunks Section */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Retrieved Chunks</h3>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                        {ragTrace?.retrieved_chunks?.length ?? 0} chunks
                      </span>
                    </div>
                    {(ragTrace?.retrieved_chunks || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <p>No chunks were retrieved for this query.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {(ragTrace?.retrieved_chunks || []).map((chunk: any, index: number) => (
                          <RetrievedChunkCard key={chunk?.id || index} chunk={chunk} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Decision and Scores Section */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <FreshnessDecisionCard decision={ragTrace?.freshness_decision || {}} />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <ScoreBreakdown scores={ragTrace?.scores || {}} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-6 bg-black/20 rounded-xl border border-white/5 text-center">
                  RAG Trace data not found for this run.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: AI Judge Trace */}
          {trace && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Step 2: AI Judge Evaluation</h3>
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300">Judge Model:</span>
                    <span className="text-sm text-emerald-400 font-mono">{trace.model}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-300">Judge Latency:</span>
                    <span className="text-sm text-amber-400 font-mono">{trace.latency_ms} ms</span>
                  </div>
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Prompt</h3>
                  </div>
                  <div className="bg-black/60 rounded-xl border border-white/5 p-4 overflow-x-auto">
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {trace.prompt}
                    </pre>
                  </div>
                </div>

                {/* Raw Output */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-rose-400" />
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Raw Output</h3>
                  </div>
                  <div className="bg-black/60 rounded-xl border border-rose-500/10 p-4 overflow-x-auto">
                    <pre className="text-xs text-rose-300/80 font-mono whitespace-pre-wrap leading-relaxed">
                      {trace.raw_response}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
