import { useThemeStore, type ThemeName } from "../../stores/themeStore";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

export function ThemeSettings() {
  const { theme, customPrimary, gradient, setTheme, setCustomPrimary, setGradient } = useThemeStore();
  return (
    <Card className="space-y-3">
      <h3 className="font-semibold">Theme Settings</h3>
      <Select value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)}>
        {["dark", "light", "blue", "red", "gradient", "custom"].map((item) => <option key={item}>{item}</option>)}
      </Select>
      <Input type="color" value={customPrimary} onChange={(event) => setCustomPrimary(event.target.value)} />
      <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={gradient} onChange={(event) => setGradient(event.target.checked)} /> Gradient mode</label>
    </Card>
  );
}
