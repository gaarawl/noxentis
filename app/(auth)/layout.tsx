import type { ReactNode } from "react";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container-app grid min-h-screen gap-8 py-6 lg:grid-cols-[0.95fr,1.05fr] lg:py-8">
      <Card className="overflow-hidden">
        <CardContent className="flex h-full flex-col justify-between p-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Noxentis</p>
            <h1 className="text-4xl font-semibold text-white">
              Facturation, conformité et trésorerie dans un seul cockpit.
            </h1>
            <p className="max-w-lg text-sm leading-7 text-white/58">
              Un univers premium pour piloter vos documents commerciaux, préparer la réforme et envoyer vos flux via partenaire PDP sans sacrifier votre image.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/58">
            À partir du 1er septembre 2026, toutes les entreprises devront pouvoir recevoir les factures électroniques via le cadre prévu. Les PME et micro-entreprises devront émettre à partir du 1er septembre 2027.
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center">
        <div className="w-full space-y-6">
          {children}
          <p className="text-sm text-white/42">
            <Link className="underline-offset-4 hover:underline" href="/">
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
