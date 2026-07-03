import { PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "default" | "primary" | "secondary" | "destructive" | "success" | "warning" | "info";

export function Badge({ children, className, variant = "default" }: PropsWithChildren<{ className?: string, variant?: BadgeVariant }>) {
  return (
    <span className={cn(
      "rounded-full border px-2 py-0.5 text-xs font-medium",
      {
        "border-border bg-muted/20 text-muted": variant === "default" || variant === "secondary",
        "border-primary bg-primary/20 text-primary": variant === "primary",
        "border-destructive bg-destructive/20 text-destructive": variant === "destructive",
        "border-green-500 bg-green-500/20 text-green-500": variant === "success",
        "border-amber-500 bg-amber-500/20 text-amber-500": variant === "warning",
        "border-blue-500 bg-blue-500/20 text-blue-500": variant === "info",
      },
      className
    )}>
      {children}
    </span>
  );
}
