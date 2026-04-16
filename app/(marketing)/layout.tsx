import type { ReactNode } from "react";

import Link from "next/link";

import { LogoMark } from "@/components/shell/logo-mark";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="container-app animate-premium-in flex items-center justify-between py-6"
        style={{ ["--enter-delay" as string]: "40ms" }}
      >
        <Link href="/">
          <LogoMark />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/#pricing">
            <Button variant="ghost">Pricing</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Se connecter</Button>
          </Link>
        </div>
      </header>
      {children}
      <footer
        className="container-app animate-premium-fade py-10 text-sm text-white/38"
        style={{ ["--enter-delay" as string]: "320ms" }}
      >
        Noxentis. Facturation electronique francaise, enfin simple et premium.
      </footer>
    </div>
  );
}
