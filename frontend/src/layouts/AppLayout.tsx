import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div
      className={`grid h-screen overflow-hidden bg-transparent text-text transition-all duration-300 ${
        sidebarCollapsed
          ? "grid-cols-[4.5rem_minmax(0,1fr)]"
          : "grid-cols-[16rem_minmax(0,1fr)]"
      } ${isChatPage ? 'grid-rows-[5rem_minmax(0,1fr)]' : 'grid-rows-[5rem_minmax(0,1fr)_3rem]'}`}
    >
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <aside className="row-span-2 min-h-0 border-r border-border glass-panel z-10 bg-panel/40">
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      <header className="min-w-0 border-b border-border bg-panel/60 backdrop-blur-md z-10">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
      </header>

      <main className="min-h-0 min-w-0 flex flex-col overflow-y-auto z-0 p-4 animate-slide-in relative">
        <Outlet />
      </main>

      {!isChatPage && (
        <footer className="col-span-2 min-w-0 border-t border-border bg-panel/60 backdrop-blur-md z-10">
          <Footer />
        </footer>
      )}
    </div>
  );
}