import { PageShell } from "../components/layout/PageShell";
import { SettingsPageFeature } from "../features/settings/SettingsPage";

export function SettingsPage() {
  return <PageShell title="Settings"><SettingsPageFeature /></PageShell>;
}
