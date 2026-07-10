import { PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ 
  open, 
  onClose, 
  children,
  className = "w-full max-w-xl"
}: PropsWithChildren<{ open: boolean; onClose: () => void; className?: string }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`relative flex flex-col max-h-[90vh] rounded-2xl border border-white/10 bg-gray-900 shadow-2xl ${className}`}>
        <div className="absolute right-4 top-4 z-10">
          <Button 
            variant="ghost" 
            className="h-8 w-8 rounded-full p-0 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={18} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
