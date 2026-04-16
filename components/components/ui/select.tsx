import * as React from "react";

import { cn } from "@/lib/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.05]",
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
