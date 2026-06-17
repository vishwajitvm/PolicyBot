export type Source = {
  source_id: string;
  name: string;
  source_type: "local_folder" | "google_drive";
  status: string;
  metadata: Record<string, unknown>;
};
