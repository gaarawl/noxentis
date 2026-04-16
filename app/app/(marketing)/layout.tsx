import type { ReactNode } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shell/logo-mark";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container-app flex items-center justify-between py-6">
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
      <footer className="container-app py-10 text-sm text-white/38">
        Noxentis. Facturation électronique française, enfin simple et premium.
      </footer>
    </div>
  );
}
