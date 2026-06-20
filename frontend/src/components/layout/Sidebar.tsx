import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Database,
  FileClock,
  Gauge,
  MessageSquare,
  Settings,
  UploadCloud,
} from "lucide-react";
import { cn } from "../../utils/cn";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/sources", label: "Sources", icon: Database },
  { to: "/ingestion", label: "Ingestion", icon: UploadCloud },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/traces/latest", label: "Traces", icon: FileClock },
  { to: "/evaluation", label: "Evaluation", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/logs", label: "Logs", icon: Bot },
];

type SidebarProps = {
  collapsed?: boolean;
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-panel">
      <div
        className={cn(
          "flex h-20 flex-shrink-0 items-center border-b border-border px-5",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            PB
          </div>
        ) : (
          <h1 className="text-lg font-bold text-text">PolicyBot Intelligence</h1>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md py-2.5 text-sm font-medium text-muted transition hover:bg-surface hover:text-text",
                collapsed ? "justify-center px-2" : "gap-3 px-4",
                isActive && "bg-primary text-white hover:bg-primary hover:text-white"
              )
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}