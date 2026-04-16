import * as React from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

const styles: Record<BadgeVariant, string> = {
  default: "bg-white/8 text-white/80 border-white/10",
  success: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  warning: "bg-amber-400/10 text-amber-100 border-amber-400/20",
  danger: "bg-rose-400/10 text-rose-100 border-rose-400/20",
  outline: "bg-transparent text-white/60 border-white/10"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.02em]",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
