import type { TraceEvent } from "../../types/trace.types";
import { formatDate, formatTime } from "../../../features/chat/ChatPage";

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
          <div key={`${event.step}-${index}`} className="border rounded-lg border-border bg-surface p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 text-primary">{stepIcon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-text">{stepName}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${event.status === 'completed' ? 'bg-success/20 text-success' : event.status === 'failed' ? 'bg-destructive/20 text-destructive' : 'bg-muted/20 text-muted'}`}>
                    {event.status}
                  </span>
                </div>
                {timestamp && <p className="text-xs text-muted">{timestamp}</p>}
              </div>
            </div>

            {/* Input Summary */}
            {Object.keys(event.input_summary || {}).length > 0 && (
              <div className="mb-3">
                <p className="font-medium text-sm mb-1">Input:</p>
                <pre className="bg-muted/50 p-3 rounded text-xs max-h-32 overflow-auto">{formatJSONSummary(event.input_summary)}</pre>
              </div>
            )}

            {/* Output Summary */}
            {Object.keys(event.output_summary || {}).length > 0 && (
              <div className="mb-3">
                <p className="font-medium text-sm mb-1">Output:</p>
                <pre className="bg-muted/50 p-3 rounded text-xs max-h-32 overflow-auto">{formatJSONSummary(event.output_summary)}</pre>
              </div>
            )}

            {/* Latency */}
            {event.latency_ms > 0 && (
              <p className="text-xs text-muted text-right">⏱️ {event.latency_ms}ms</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
