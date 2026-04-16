export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-glow">
        <div className="absolute inset-1 rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_55%)]" />
        <span className="relative text-lg font-semibold tracking-[-0.08em] text-white">Nx</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm uppercase tracking-[0.28em] text-white/35">Noxentis</p>
        <p className="text-sm text-white/60">Facturation électronique premium</p>
      </div>
    </div>
  );
}
