import type { TraceEvent } from "../../types/trace.types";
import { Timeline } from "../ui/Timeline";

export function TraceTimeline({ events }: { events: TraceEvent[] }) {
  return <Timeline events={events} />;
}
