import { apiClient } from "./client";

export type DriveConfig = {
  client_id: string;
  api_key: string;
  scopes: string;
  picker_enabled: boolean;
};

export const getDriveConfig = () => apiClient<DriveConfig>("/google-drive/config");
export const sendPickerSelection = (items: Array<Record<string, unknown>>) =>
  apiClient("/google-drive/picker-selection", { method: "POST", body: JSON.stringify({ items }) });
export const syncDriveFolder = (folder_id: string, source_id?: string) =>
  apiClient("/google-drive/folder-sync", { method: "POST", body: JSON.stringify({ folder_id, source_id }) });
