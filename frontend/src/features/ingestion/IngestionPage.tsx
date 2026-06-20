import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { listIngestionJobs } from "../../api/ingestion.api";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { IngestionJobStatus } from "./IngestionJobStatus";
import { IngestionLogPanel } from "./IngestionLogPanel";
import { IngestionDashboard } from "./IngestionDashboard";

export function IngestionPageFeature() {
  const { data = [] } = useQuery({ queryKey: ["ingestion-jobs"], queryFn: listIngestionJobs, retry: false, refetchInterval: 30000 }); // Reduce polling frequency for list
  const latest = data[0];
  const [activeJob, setActiveJob] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Show dashboard for the latest job if it's running and we have data
  const showDashboard = latest && latest.status === "running";

  // WebSocket connection for active job
  useEffect(() => {
    // Cleanup previous connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (showDashboard && latest?.job_id) {
      // Use the same base URL as the API client but convert http to ws
      const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')}/ingestion/ws/${latest.job_id}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected for job ${latest.job_id}`);
      };

      ws.onmessage = (event) => {
        try {
          const jobData = JSON.parse(event.data);
          setActiveJob(jobData);
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for job ${latest.job_id}`);
        wsRef.current = null;
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [showDashboard, latest?.job_id, latest]);

  const displayJob = activeJob ?? latest;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      {!showDashboard && (
        <Card>
          <h3 className="mb-3 font-semibold">Ingestion Jobs</h3>
          {data.length ? <div className="space-y-3">{data.map((job) => <IngestionJobStatus key={job.job_id} job={job} />)}</div> : <EmptyState title="No ingestion jobs yet" />}
        </Card>
      )}
      {showDashboard && latest ? (
        <IngestionDashboard job={displayJob} />
      ) : (
        <IngestionLogPanel logs={latest?.logs ?? []} />
      )}
    </div>
  );
}