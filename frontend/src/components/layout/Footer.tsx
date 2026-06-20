import { cn } from "../../utils/cn";

export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-sm text-muted">
      <span>Developed by vishwajit vm</span>
      <a href="https://github.com/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:text-text">
        GitHub: vishwajitvm
      </a>
    </footer>
  );
}