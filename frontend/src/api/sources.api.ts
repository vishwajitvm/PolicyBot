import type { Source } from "../types/source.types";
import { apiClient } from "./client";

export const listSources = () => apiClient<Source[]>("/sources");
export const createLocalSource = (folder_path: string, name?: string) =>
  apiClient<Source>("/sources/local-folder", { method: "POST", body: JSON.stringify({ folder_path, name }) });
export const createDriveSource = (body: { drive_item_id: string; name: string; mime_type?: string; is_folder?: boolean }) =>
  apiClient<Source>("/sources/google-drive", { method: "POST", body: JSON.stringify(body) });
export const deleteSource = (sourceId: string) => apiClient(`/sources/${sourceId}`, { method: "DELETE" });
