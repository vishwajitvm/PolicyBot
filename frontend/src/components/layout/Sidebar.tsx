import { NavLink } from "react-router-dom";
import { BarChart3, Bot, Database, FileClock, Gauge, MessageSquare, Settings, UploadCloud } from "lucide-react";
import { cn } from "../../utils/cn";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/sources", label: "Sources", icon: Database },
  { to: "/ingestion", label: "Ingestion", icon: UploadCloud },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/traces/latest", label: "Traces", icon: FileClock },
  { to: "/evaluation", label: "Evaluation", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/logs", label: "Logs", icon: Bot }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-panel p-4 md:block">
      <div className="mb-6 text-lg font-bold text-text">PolicyBot</div>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-text", isActive && "bg-primary text-white hover:bg-primary hover:text-white")
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
