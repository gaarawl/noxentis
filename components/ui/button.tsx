import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "premium";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,rgba(252,252,252,0.96),rgba(176,186,202,0.92))] text-black shadow-[0_12px_30px_rgba(255,255,255,0.08)] hover:brightness-105",
  premium:
    "relative isolate overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(231,236,242,0.96))] text-black ring-1 ring-white/70 shadow-[0_12px_30px_rgba(255,255,255,0.12)] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.34),transparent_62%)] before:opacity-0 before:transition before:duration-300 after:pointer-events-none after:absolute after:-left-20 after:top-[-20%] after:h-[140%] after:w-14 after:-rotate-[24deg] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.96),transparent)] after:opacity-0 after:blur-md after:transition-all after:duration-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.7),0_0_32px_rgba(255,255,255,0.35)] hover:before:opacity-100 hover:after:left-[120%] hover:after:opacity-100",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/[0.08]",
  ghost: "text-white/70 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
