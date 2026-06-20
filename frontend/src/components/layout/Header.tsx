import { useQuery } from "@tanstack/react-query";
import { getConfig } from "../../api/config.api";
import { useThemeStore, type ThemeName } from "../../stores/themeStore";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

const themes: ThemeName[] = ["dark", "light", "blue", "red", "gradient", "custom"];

export function Header() {
  const { data } = useQuery({ queryKey: ["config"], queryFn: getConfig, retry: false });
  const { theme, setTheme } = useThemeStore();
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3">
      <div>
        <h1 className="text-lg font-bold text-text">PolicyBot Intelligence</h1>
        <div className="mt-1 flex flex-wrap gap-2">
          <Badge>{data?.llm_provider ?? "LLM"} / {data?.chat_model ?? "model"}</Badge>
          <Badge>{data?.vector_db_provider ?? "vector db"}</Badge>
        </div>
      </div>
      <Select value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)} aria-label="Theme selector">
        {themes.map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
    </header>
  );
}