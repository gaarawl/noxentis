import { cn } from "@/lib/cn";

export function LogoMark({
  compact = false,
  subtitle = "Facturation electronique premium",
  className
}: {
  compact?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),linear-gradient(180deg,#111214,#090a0c)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_34px_rgba(0,0,0,0.42)]">
        <div className="absolute inset-[2px] rounded-full border border-white/[0.06]" />
        <span className="relative text-[1rem] font-semibold tracking-[-0.08em] text-white">
          N<span className="text-[0.92em] text-white/92">x</span>
        </span>
      </div>
      {compact ? null : (
        <div className="space-y-0.5">
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">Noxentis</p>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
      )}
    </div>
  );
}
