import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function QueryTracePreview({ traceId }: { traceId: string }) {
  return <Link to={`/traces/${traceId}`}><Button>Open Full Trace</Button></Link>;
}
