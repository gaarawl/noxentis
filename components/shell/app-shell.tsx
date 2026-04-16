"use client";

import { useTransition, type ReactNode } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  FileCheck2,
  FileText,
  Gauge,
  LayoutList,
  Receipt,
  RefreshCcw,
  Settings2,
  Users
} from "lucide-react";

import { LogoMark } from "@/components/shell/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/domain/models";
import { useUiStore } from "@/lib/store/ui-store";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/quotes", label: "Devis", icon: LayoutList },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/credit-notes", label: "Avoirs", icon: RefreshCcw },
  { href: "/payments", label: "Paiements", icon: CreditCard },
  { href: "/reminders", label: "Relances", icon: Receipt },
  { href: "/compliance", label: "Conformite", icon: FileCheck2 },
  { href: "/integrations/pdp", label: "PDP", icon: Settings2 },
  { href: "/billing", label: "Billing", icon: CreditCard }
];

export function AppShell({
  children,
  user,
  pdpConnected
}: {
  children: ReactNode;
  user: SessionUser | null;
  pdpConnected: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-80" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside
          className={cn(
            "animate-premium-in sticky top-4 hidden h-[calc(100vh-2rem)] flex-col rounded-[30px] border border-white/8 bg-black/40 px-4 py-5 shadow-panel backdrop-blur-2xl lg:flex",
            sidebarCollapsed ? "w-[96px]" : "w-[288px]"
          )}
          style={{ ["--enter-delay" as string]: "40ms" }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className={cn(sidebarCollapsed && "hidden")}>
              <LogoMark />
            </div>
            {sidebarCollapsed ? (
              <div className="mx-auto">
                <LogoMark />
              </div>
            ) : null}
            <button
              aria-label="Basculer la sidebar"
              onClick={toggleSidebar}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60 transition hover:text-white"
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-white/14 bg-white/[0.08] text-white shadow-glow"
                      : "border-transparent text-white/55 hover:border-white/8 hover:bg-white/[0.04] hover:text-white",
                    sidebarCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className={cn(sidebarCollapsed && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={cn("space-y-3", sidebarCollapsed && "hidden")}>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Conformite</p>
              <p className="mt-2 text-lg font-semibold text-white">Diagnostic actif</p>
              <p className="mt-1 text-sm text-white/55">
                Mentions, PDP et transmission sont suivis en temps reel.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col gap-6">
          <header
            className="animate-premium-in sticky top-4 z-20 flex items-center justify-between rounded-[30px] border border-white/8 bg-black/45 px-6 py-4 backdrop-blur-2xl"
            style={{ ["--enter-delay" as string]: "90ms" }}
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Cockpit premium</p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                {user?.companyName || "Noxentis"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline">{user?.plan || "PRO"}</Badge>
              <Badge variant={pdpConnected ? "success" : "warning"}>
                {pdpConnected ? "PDP partenaire connectee" : "PDP a connecter"}
              </Badge>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80">
                {user?.firstName || "Clara"} {user?.lastName || "Martin"}
              </div>
              <Link href="/settings/account">
                <Button variant="secondary" size="sm">
                  Parametres
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoggingOut}
                onClick={() => {
                  startLogoutTransition(async () => {
                    await fetch("/api/auth/logout", {
                      method: "POST"
                    });
                    router.push("/login");
                    router.refresh();
                  });
                }}
              >
                {isLoggingOut ? "Deconnexion..." : "Deconnexion"}
              </Button>
            </div>
          </header>

          <main
            key={pathname}
            className="animate-premium-in pb-8"
            style={{ ["--enter-delay" as string]: "140ms" }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
