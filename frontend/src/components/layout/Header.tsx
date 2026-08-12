import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { getConfig } from "../../api/config.api";
import { useThemeStore, type ThemeName } from "../../stores/themeStore";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import {
  BrainCircuit,
  DatabaseZap,
} from "lucide-react";

const themes: ThemeName[] = ["dark", "light", "blue"];

type HeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
    retry: false,
  });

  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex h-full items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-text"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="mt-2 flex flex-wrap gap-3">
  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-sm">
    <BrainCircuit size={14} />
    <span>
      {data?.llm_provider ?? "LLM"} · {data?.chat_model ?? "model"}
    </span>
  </div>

  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-sm">
    <DatabaseZap size={14} />
    <span>{data?.vector_db_provider ?? "Vector DB"}</span>
  </div>
</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
          <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
        <Select
          value={theme}
          onChange={(event) => setTheme(event.target.value as ThemeName)}
          aria-label="Theme selector"
          className="w-28"
        >
          {themes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}