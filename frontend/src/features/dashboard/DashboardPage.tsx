import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/health.api";
import { Card } from "../../components/ui/Card";
import { DashboardCards } from "./DashboardCards";

export function DashboardPageFeature() {
  const { data, error } = useQuery({ queryKey: ["health"], queryFn: getHealth, retry: false });
  return (
    <div className="space-y-5">
      <DashboardCards />
      <Card>
        <h3 className="font-semibold">System Health</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p className="text-sm text-muted">Backend: {data?.status ?? (error ? "unreachable" : "checking")}</p>
          <p className="text-sm text-muted">MongoDB: {data?.mongodb.status ?? "unknown"}</p>
          <p className="text-sm text-muted">Vector DB: {data?.vector_store.status ?? "unknown"}</p>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><h3 className="font-semibold">Queries Over Time</h3><div className="mt-4 h-32 rounded-md bg-surface" /></Card>
        <Card><h3 className="font-semibold">Confidence Trend</h3><div className="mt-4 h-32 rounded-md bg-surface" /></Card>
        <Card><h3 className="font-semibold">Ingestion Status</h3><div className="mt-4 h-32 rounded-md bg-surface" /></Card>
      </div>
    </div>
  );
}
