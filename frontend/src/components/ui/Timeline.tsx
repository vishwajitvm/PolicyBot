import type { TraceEvent } from "../../types/trace.types";
import { formatDate, formatTime } from "../../utils/formatters";

function formatJSONSummary(summary: Record<string, unknown>): string {
  // Filter out empty summaries and format nicely
  if (!summary || Object.keys(summary).length === 0) {
    return "No details";
  }

  // Format with indentation and limit depth for readability
  return JSON.stringify(summary, null, 2)
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

function getStepIcon(step: string): string {
  const stepLower = step.toLowerCase();
  if (stepLower.includes('query')) return '🔍';
  if (stepLower.includes('retriev') || stepLower.includes('candidate')) return '📄';
  if (stepLower.includes('embed')) return '🧠';
  if (stepLower.includes('rerank')) return '📊';
  if (stepLower.includes('freshness')) return '⏰';
  if (stepLower.includes('grade') || stepLower.includes('context')) return '📝';
  if (stepLower.includes('prompt')) return '💬';
  if (stepLower.includes('answer') || stepLower.includes('generate')) return '🤖';
  if (stepLower.includes('citation')) return '🔗';
  if (stepLower.includes('score') || stepLower.includes('confiden')) return '📈';
  if (stepLower.includes('persist')) return '💾';
  if (stepLower.includes('return')) return '↩️';
  return '⚙️';
}

export function Timeline({ events }: { events: TraceEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-center text-muted py-4">No trace events available</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const stepName = event.step.replace(/_/g, " ");
        const stepIcon = getStepIcon(event.step);
        const timestamp = event.timestamp ? formatTime(new Date(event.timestamp).toISOString()) : "";

        return (
          <div key={`${event.step}-${index}`} className="border rounded-xl border-white/5 bg-white/5 backdrop-blur-sm p-5 shadow-lg transition-all hover:bg-white/10 hover:border-white/10">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-shrink-0 text-indigo-400 text-xl pt-0.5">{stepIcon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-white tracking-wide">{stepName}</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${event.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : event.status === 'failed' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {event.status}
                  </span>
                </div>
                {timestamp && <p className="text-xs text-gray-400 font-medium">{timestamp}</p>}
              </div>
            </div>

            {/* Input Summary */}
            {Object.keys(event.input_summary || {}).length > 0 && (
              <div className="mb-4 mt-3">
                <p className="font-medium text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-indigo-500/50"></span>
                  Input
                </p>
                <pre className="bg-black/40 border border-white/5 p-3.5 rounded-lg text-xs text-gray-300 font-mono max-h-40 overflow-y-auto shadow-inner">{formatJSONSummary(event.input_summary)}</pre>
              </div>
            )}

            {/* Output Summary */}
            {Object.keys(event.output_summary || {}).length > 0 && (
              <div className="mb-3 mt-3">
                <p className="font-medium text-sm text-gray-300 mb-1.5 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-purple-500/50"></span>
                  Output
                </p>
                <pre className="bg-black/40 border border-white/5 p-3.5 rounded-lg text-xs text-gray-300 font-mono max-h-40 overflow-y-auto shadow-inner">{formatJSONSummary(event.output_summary)}</pre>
              </div>
            )}

            {/* Latency */}
            {event.latency_ms > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <p className="text-xs text-gray-400 font-medium bg-black/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="text-[10px]">⏱️</span> {event.latency_ms}ms
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
