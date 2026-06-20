import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/health.api";
import { getDashboardStats } from "../../api/dashboard.api";
import { Card } from "../../components/ui/Card";
import { DashboardCards } from "./DashboardCards";

export function DashboardPageFeature() {
  const { data: healthData, error: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false
  });
  const { data: statsData, error: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: false
  });

  return (
    <div className="space-y-5">
      <DashboardCards stats={statsData} />
      <Card>
        <h3 className="font-semibold">System Health</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p className="text-sm text-muted">Backend: {healthData?.status ?? (healthError ? "unreachable" : "checking")}</p>
          <p className="text-sm text-muted">MongoDB: {healthData?.mongodb.status ?? "unknown"}</p>
          <p className="text-sm text-muted">Vector DB: {healthData?.vector_store.status ?? "unknown"}</p>
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
