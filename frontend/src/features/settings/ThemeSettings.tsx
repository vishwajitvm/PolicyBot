import { useThemeStore, type ThemeName } from "../../stores/themeStore";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

export function ThemeSettings() {
  const { theme, gradient, setTheme, setGradient } = useThemeStore();
  return (
    <Card className="space-y-4 p-6 glass-card border-border hover:border-primary/20 transition-all bg-panel/30">
      <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-text to-muted tracking-wider uppercase">Theme Settings</h3>
      <div className="space-y-4">
        <Select 
          value={theme} 
          onChange={(event) => setTheme(event.target.value as ThemeName)}
          className="w-full bg-panel/50 border-border"
        >
          {["dark", "light", "blue"].map((item) => <option key={item}>{item}</option>)}
        </Select>
        
        <label className="flex items-center gap-3 text-sm text-text cursor-pointer p-3 rounded-lg border border-border bg-panel/20 hover:bg-panel/40 transition-colors">
          <input 
            type="checkbox" 
            checked={gradient} 
            onChange={(event) => setGradient(event.target.checked)} 
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
          /> 
          Gradient Mode
        </label>
      </div>
    </Card>
  );
}
