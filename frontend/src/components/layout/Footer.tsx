import { cn } from "../../utils/cn";

export function Footer() {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-muted w-full">
      <span>Developed by vishwajit vm</span>
      <a href="https://github.com/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:text-text">
        GitHub: vishwajitvm
      </a>
    </div>
  );
}