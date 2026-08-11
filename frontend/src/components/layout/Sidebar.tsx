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
  { to: "/models", label: "Models & Config", icon: Database },
];

type SidebarProps = {
  collapsed?: boolean;
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-transparent">
      <div
        className={cn(
          "flex h-20 flex-shrink-0 items-center border-b border-border px-5",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/50 text-sm font-bold text-primary text-glow-primary">
            PB
          </div>
        ) : (
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow">
            PolicyBot Intelligence
          </h1>
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
                "flex items-center rounded-lg py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                collapsed ? "justify-center px-2" : "gap-4 px-4",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_15px_rgba(0,220,200,0.1)]" 
                  : "text-muted hover:bg-surface hover:text-text"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-glow-primary")} />
                {!collapsed && <span className="z-10">{label}</span>}
                
                {/* Hover highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-0"></div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}