import { ProviderSettings } from "./ProviderSettings";
import { ThemeSettings } from "./ThemeSettings";
import { VectorStoreSettings } from "./VectorStoreSettings";

export function SettingsPageFeature() {
  return <div className="grid gap-4 lg:grid-cols-3"><ProviderSettings /><VectorStoreSettings /><ThemeSettings /></div>;
}
