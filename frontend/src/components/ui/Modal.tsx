import { PropsWithChildren, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ 
  open, 
  onClose, 
  children,
  className = "w-full max-w-xl"
}: PropsWithChildren<{ open: boolean; onClose: () => void; className?: string }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`relative flex flex-col max-h-[90vh] rounded-2xl border border-white/10 bg-gray-900 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
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
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
