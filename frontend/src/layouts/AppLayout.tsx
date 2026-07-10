import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`grid h-screen overflow-hidden bg-surface text-text transition-all duration-300 ${
        sidebarCollapsed
          ? "grid-cols-[4.5rem_minmax(0,1fr)]"
          : "grid-cols-[16rem_minmax(0,1fr)]"
      } grid-rows-[5rem_minmax(0,1fr)_3rem]`}
    >
      <aside className="row-span-2 min-h-0 border-r border-border bg-panel">
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      <header className="min-w-0 border-b border-border bg-panel">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
      </header>

      <main className="min-h-0 min-w-0 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      <footer className="col-span-2 min-w-0 border-t border-border bg-panel">
        <Footer />
      </footer>
    </div>
  );
}