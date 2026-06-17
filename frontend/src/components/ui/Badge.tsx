import { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn("rounded-full border border-border px-2 py-1 text-xs font-medium text-muted", className)}>{children}</span>;
}
