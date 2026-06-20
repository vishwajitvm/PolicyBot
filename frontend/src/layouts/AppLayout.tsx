import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-surface text-text">
      {/* Header - Fixed at top */}
      <header className="fixed inset-x-0 top-0 z-30 bg-panel border-b border-border h-[3.5rem]">
        <Header />
      </header>

      {/* Sidebar - Fixed vertically BETWEEN header and footer */}
      <aside className="fixed left-0 top-[3.5rem] bottom-[3rem] w-64 z-20 bg-panel border-r border-border hidden md:block">
        <Sidebar />
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex-col relative">
        {/* Content area - Scrollable with proper spacing */}
        <main className="mt-[4.5rem] mb-[3rem] ml-0 md:ml-[16rem] overflow-auto p-4 flex-1">
          <Outlet />
        </main>

        {/* Footer - Fixed at bottom */}
        <footer className="fixed inset-x-0 bottom-0 z-30 bg-panel border-t border-border h-[3rem]">
          <Footer />
        </footer>
      </div>
    </div>
  );
}