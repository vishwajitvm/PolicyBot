import type { TraceEvent } from "../../types/trace.types";

export function Timeline({ events }: { events: TraceEvent[] }) {
  return (
    <ol className="space-y-3">
      {events.map((event, index) => (
        <li key={`${event.step}-${index}`} className="rounded-md border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-text">{event.step.replace(/_/g, " ")}</span>
            <span className="text-xs text-muted">{event.status}</span>
          </div>
          <pre className="mt-2 max-h-28 overflow-auto text-xs text-muted">{JSON.stringify(event.output_summary, null, 2)}</pre>
        </li>
      ))}
    </ol>
  );
}
