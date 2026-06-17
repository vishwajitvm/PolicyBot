import { PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ open, onClose, children }: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-lg border border-border bg-panel p-4 shadow-xl">
        <div className="mb-3 flex justify-end">
          <Button className="h-8 w-8 p-0" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
