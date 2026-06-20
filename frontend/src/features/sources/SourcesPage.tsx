import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UploadCloud } from "lucide-react";
import { deleteSource, listSources } from "../../api/sources.api";
import { startIngestion } from "../../api/ingestion.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { DrivePickerModal } from "./DrivePickerModal";
import { GoogleDriveConnectButton } from "./GoogleDriveConnectButton";
import { LocalFolderSourceCard } from "./LocalFolderSourceCard";
import { SelectedDriveSourceCard } from "./SelectedDriveSourceCard";

export function SourcesPageFeature() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data = [] } = useQuery({ queryKey: ["sources"], queryFn: listSources, retry: false });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteSource, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }) });
  const ingest = useMutation({
    mutationFn: startIngestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-jobs"] });
    },
  });
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <LocalFolderSourceCard />
        <Card>
          <h3 className="mb-3 font-semibold">Google Drive Source</h3>
          <GoogleDriveConnectButton onClick={() => setPickerOpen(true)} />
        </Card>
      </div>
      <SelectedDriveSourceCard />
      <Card>
        <h3 className="mb-3 font-semibold">Connected Sources</h3>
        {data.length === 0 ? <EmptyState title="No sources connected" /> : (
          <div className="space-y-3">
            {data.map((source) => (
              <div key={source.source_id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-3">
                <div><strong>{source.name}</strong><p className="text-sm text-muted">{source.source_type} · {source.status}</p></div>
                <div className="flex gap-2">
                  <Button disabled={ingest.isPending} onClick={() => ingest.mutate(source.source_id)}>
                    {ingest.isPending ? (
                      <>
                        <UploadCloud size={16} className="mr-2 h-4 w-4 animate-spin" />
                        Ingesting...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} /> Start Ingestion
                      </>
                    )}
                  </Button>
                  <Button className="bg-red-500" onClick={() => remove.mutate(source.source_id)}><Trash2 size={16} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <DrivePickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
