import { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary", className)} {...props} />;
}
