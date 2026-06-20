import { useEffect, useState, useRef } from "react";
import { listIngestionJobs } from "../../api/ingestion.api";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { IngestionJobStatus } from "./IngestionJobStatus";
import { IngestionDashboard } from "./IngestionDashboard";
import type { IngestionJob } from "../../api/ingestion.api";

export function IngestionPageFeature() {
  // Refs for data that shouldn't cause re-renders on update
  const jobsMapRef = useRef<Map<string, IngestionJob>>(new Map());
  const wsConnectionsRef = useRef<Map<string, WebSocket>>(new Map());

  // State variables to trigger re-renders when data changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial fetch and periodic polling to discover new/removed jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobList = await listIngestionJobs();
        const newMap = new Map<string, IngestionJob>();
        jobList.forEach((job) => {
          newMap.set(job.job_id, job);

          // Ensure WS connection exists for each job
          if (!wsConnectionsRef.current.has(job.job_id)) {
            startWsConnection(job.job_id);
          }
        });

        // Detect removed jobs to close WS connections
        const oldMap = jobsMapRef.current;
        oldMap.forEach((oldJob, jobId) => {
          if (!newMap.has(jobId)) {
            // Removed job: close WS connection
            const ws = wsConnectionsRef.current.get(jobId);
            if (ws) {
              ws.close();
              wsConnectionsRef.current.delete(jobId);
            }
          }
        });

        // Update the jobs map ref
        jobsMapRef.current = newMap;
        // Trigger re-render for initial load or polling updates
        setUpdateTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Failed to fetch ingestion jobs:", error);
      }
    };

    // Fetch immediately on mount
    fetchJobs();

    // Set up periodic polling to discover new/removed jobs (every 30 seconds)
    // This is a fallback in case WS connection misses job creation events
    const intervalId = setInterval(fetchJobs, 30000);

    return () => {
      clearInterval(intervalId);
      // Close all WS connections
      wsConnectionsRef.current.forEach((ws) => {
        ws.close();
      });
      wsConnectionsRef.current.clear();
    };
  }, []); // Run only on mount (empty deps) - polling is handled by setInterval inside

  // Function to start a WS connection for a given jobId
  const startWsConnection = (jobId: string) => {
    // Don't start duplicate connections
    if (wsConnectionsRef.current.has(jobId)) {
      return;
    }

    const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')}/ingestion/ws/${jobId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`WebSocket connected for job ${jobId}`);
    };

    ws.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        // Validate that we have a job_id
        if (!eventData.job_id) {
          console.error("Received WebSocket message without job_id:", eventData);
          return;
        }

        const jobData: IngestionJob = eventData;
        // Update the job in our map ref
        const currentMap = new Map(jobsMapRef.current);
        currentMap.set(jobData.job_id, jobData);
        jobsMapRef.current = currentMap;

        // If this is a new job we didn't know about, start WS connection for it
        if (!wsConnectionsRef.current.has(jobData.job_id)) {
          startWsConnection(jobData.job_id);
        }

        // Trigger re-render for WS updates
        setUpdateTrigger(prev => prev + 1);
      } catch (e) {
        // Safely extract job ID for logging
        let logJobId = jobId; // Default to the connection's job ID
        try {
          const parsed = JSON.parse(event.data);
          logJobId = parsed.job_id || logJobId;
        } catch {
          // If we can't parse, use the connection job ID
        }
        console.error("Failed to process WebSocket message for job", logJobId, e);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for job ${jobId}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for job ${jobId}`);
      wsConnectionsRef.current.delete(jobId);
    };

    wsConnectionsRef.current.set(jobId, ws);
  };

  // Get the latest jobs array for rendering
  const jobsArray = Array.from(jobsMapRef.current.values());

  // Auto-select the latest running job if nothing is manually selected
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<IngestionJob | null>(null);

  useEffect(() => {
    if (!selectedJobId) {
      // Only auto-select if nothing is selected
      const runningJob = jobsArray.find((job) => job.status === "running");
      if (runningJob) {
        setSelectedJobId(runningJob.job_id);
      }
    }
    // Note: We don't auto-clear selection when no jobs exist because
    // the selectedJob might be from a previous fetch and we want to keep showing it
    // until the user explicitly clears it or selects another job
  }, [jobsArray, selectedJobId, updateTrigger]); // Re-run when jobs data changes or updateTrigger changes

  // Update selectedJob when the job in the map changes
  useEffect(() => {
    if (selectedJobId) {
      const job = jobsMapRef.current.get(selectedJobId);
      if (job) {
        setSelectedJob(job);
      } else {
        // Job no longer exists, clear selection
        setSelectedJobId(null);
        setSelectedJob(null);
      }
    }
  }, [selectedJobId, jobsArray, updateTrigger]); // Re-run when jobs data changes or updateTrigger changes

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Ingestion Jobs</h2>
        {jobsArray.length > 0 && (
          <button
            onClick={() => {
              setSelectedJobId(null);
              setSelectedJob(null);
            }}
            className="text-sm text-muted hover:text-offset-hover"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Selected Job Dashboard or Job List */}
      {selectedJob ? (
        <Card>
          <IngestionDashboard job={selectedJob} />
        </Card>
      ) : (
        <>
          {jobsArray.length > 0 ? (
            <div className="space-y-3">
              {jobsArray.map((job) => (
                <IngestionJobStatus
                  key={job.job_id}
                  job={job}
                  onClick={() => {
                    setSelectedJobId(job.job_id);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No ingestion jobs yet" />
          )}
        </>
      )}
    </div>
  );
}