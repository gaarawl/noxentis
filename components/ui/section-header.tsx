import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="animate-premium-in flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      style={{ ["--enter-delay" as string]: "90ms" }}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">{eyebrow}</p>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-white/55">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
