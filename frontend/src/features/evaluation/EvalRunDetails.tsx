import { useState, useEffect } from "react";
import type { EvaluationRun } from "../../types/evaluation.types";
import { Card } from "../../components/ui/Card";
import { ActivitySquare, CheckCircle2, XCircle, Target, ChevronDown, ChevronUp, MessageSquare, BookOpen, AlertCircle, Bot, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function EvalRunDetails({ runs, isLoading, activeDatasetId }: { runs: EvaluationRun[], isLoading?: boolean, activeDatasetId?: string | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Automatically expand if a specific dataset was requested
  useEffect(() => {
    if (activeDatasetId && runs.length > 0) {
      // Find the most recent run for this dataset
      const runForDataset = runs.find(r => r.dataset_id === activeDatasetId);
      if (runForDataset) {
        setExpandedId(runForDataset.run_id);
      }
    }
  }, [activeDatasetId, runs]);

  // Helper to safely parse item
  const parseItem = (item: any) => {
    if (typeof item === 'string') {
      try {
        const parsed = JSON.parse(item);
        return { 
          question: parsed.question || 'Unknown', 
          expected: parsed.expected_answer || 'Unknown',
          generated: parsed.generated_answer || ''
        };
      } catch (e) {
        return { question: item, expected: '', generated: '' };
      }
    }
    return { 
      question: item?.question || 'Unknown', 
      expected: item?.expected_answer || '',
      generated: item?.generated_answer || ''
    };
  };

  return (
    <Card className="flex flex-col h-full bg-slate-900/50 border-white/5 p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <ActivitySquare className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Evaluation Runs</h3>
      </div>

      <div className="flex-1 flex flex-col gap-3 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : !activeDatasetId ? (
          <div className="text-sm text-slate-500 italic text-center py-10 bg-black/20 rounded-xl border border-white/5">
            Select a dataset from the left to view its evaluation runs.
          </div>
        ) : runs.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center py-10 bg-black/20 rounded-xl border border-white/5">
            No evaluations run yet for this dataset. Click "Run Evaluation" to test it.
          </div>
        ) : (
          runs.map((run: any, idx: number) => {
            const acc = run.accuracy ?? 0;
            const isGood = acc >= 80;
            const isBad = acc < 50;
            const isExpanded = expandedId === run.run_id;
            const isActive = activeDatasetId === run.dataset_id;
            const timeAgo = run.created_at ? formatDistanceToNow(new Date(run.created_at), { addSuffix: true }) : "just now";
            
            return (
              <div key={run.run_id || idx} className={`flex flex-col rounded-xl border transition-all duration-300 group overflow-hidden ${
                isActive && isExpanded ? 'bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
              }`}>
                {/* Summary Header (Clickable) */}
                <div 
                  className="flex flex-col gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : run.run_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      <div className="flex items-center gap-2">
                        <div className="text-[11px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                          Run: {run.run_id?.split('-')[0]}
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">
                          Golden Standard
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo}
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isGood ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        isBad ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        <Target className="w-3.5 h-3.5" />
                        {acc.toFixed(1)}% Accuracy
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono">{run.passed ?? 0}</span> Passed
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="font-mono">{run.failed ?? 0}</span> Failed
                    </div>
                    
                    {run.details && run.details.length > 0 && (
                      <div className="ml-auto text-[10px] text-slate-500 group-hover:text-indigo-400 transition-colors font-medium">
                        {isExpanded ? "Hide Details" : "View Details"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && run.details && (
                  <div className={`flex flex-col gap-4 p-4 border-t ${isActive ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-black/40 border-white/5'}`}>
                    {run.details.length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-4">No item details available.</div>
                    ) : (
                      run.details.map((detail: any, dIdx: number) => {
                        const parsed = parseItem(detail.item);
                        return (
                          <div key={dIdx} className="flex flex-col gap-3 p-5 bg-slate-900/80 rounded-xl border border-white/5 relative">
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4 z-10">
                              {detail.passed ? (
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  PASS
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                                  <XCircle className="w-3.5 h-3.5" />
                                  FAIL
                                </div>
                              )}
                            </div>

                            {/* Q & A */}
                            <div className="flex flex-col gap-3 pr-20 relative z-0">
                              <div className="flex items-start gap-2.5">
                                <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                <div className="text-sm font-medium text-slate-200 leading-snug">
                                  {parsed.question}
                                </div>
                              </div>
                              
                              <div className="pl-6 border-l-2 border-slate-700/50 flex flex-col gap-3">
                                {parsed.expected && (
                                  <div className="flex items-start gap-2">
                                    <BookOpen className="w-4 h-4 text-emerald-500/70 mt-0.5 shrink-0" />
                                    <div className="text-xs text-slate-300">
                                      <span className="font-semibold text-emerald-500/90 block mb-0.5 text-[10px] uppercase tracking-wide">Expected Answer</span>
                                      <div className="bg-black/30 p-2 rounded-md border border-white/5">
                                        {parsed.expected}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {parsed.generated && (
                                  <div className="flex items-start gap-2">
                                    <Bot className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
                                    <div className="text-xs text-slate-300">
                                      <span className="font-semibold text-blue-400/90 block mb-0.5 text-[10px] uppercase tracking-wide">Generated Answer</span>
                                      <div className="bg-black/30 p-2 rounded-md border border-white/5">
                                        {parsed.generated}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Reasoning */}
                            {detail.reason && (
                              <div className="mt-3 text-xs text-slate-300 bg-black/50 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px] block mb-1">AI Judge Reason</span>
                                  <span className="italic leading-relaxed">{detail.reason}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
