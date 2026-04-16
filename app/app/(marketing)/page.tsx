import Link from "next/link";
import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";

import { FaqList } from "@/components/marketing/faq-list";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqItems, marketingFeatures, pricingPlans } from "@/lib/data/demo-data";
import { siteConfig } from "@/lib/config/site";

export default function LandingPage() {
  return (
    <main className="pb-16">
      <section className="container-app grid gap-10 py-10 lg:grid-cols-[1.1fr,0.9fr] lg:py-16">
        <div className="space-y-8">
          <Badge variant="outline">Compatible réforme 2026/2027 • Connectable PDP partenaire</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/58">
              Un cockpit noir sur noir, haut de gamme et rassurant pour créer vos devis et
              factures, préparer la conformité, transmettre via partenaire agréé, piloter vos
              paiements et relancer vos clients avec élégance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" variant="premium">
                Démarrer l'essai premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="secondary">
                Voir les plans
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-white/42">Émission & réception</p>
                <p className="text-xl font-semibold text-white">Prêt pour septembre 2026</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-white/42">Relances</p>
                <p className="text-xl font-semibold text-white">Automatiques et premium</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-white/42">PDP</p>
                <p className="text-xl font-semibold text-white">Architecture prête à brancher</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="surface relative overflow-hidden p-6">
          <div className="hero-grid absolute inset-0 opacity-40" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-between rounded-3xl border border-white/8 bg-black/35 p-5">
              <div>
                <p className="text-sm text-white/45">CA du mois</p>
                <p className="mt-2 text-3xl font-semibold text-white">14 700 €</p>
              </div>
              <Badge variant="success">+14 %</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="space-y-3 p-5">
                  <ShieldCheck className="h-5 w-5 text-white/72" />
                  <p className="text-lg font-semibold text-white">Conformité</p>
                  <p className="text-sm text-white/52">
                    Mentions obligatoires vérifiées, connexion partenaire active, score 84/100.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <Wallet className="h-5 w-5 text-white/72" />
                  <p className="text-lg font-semibold text-white">Trésorerie</p>
                  <p className="text-sm text-white/52">
                    Encaissements, retards, relances et cash attendu dans une seule vue.
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/42">Statut facture FAC-2026-118</p>
                  <Badge variant="success">Transmise</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/32">PDF</p>
                    <p className="mt-2 text-sm text-white/72">Document visuel premium</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/32">Flux</p>
                    <p className="mt-2 text-sm text-white/72">Payload structuré préparé</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/32">PDP</p>
                    <p className="mt-2 text-sm text-white/72">Statut récupéré automatiquement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-app space-y-10 py-14">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Pour qui</p>
          <h2 className="text-4xl font-semibold text-white">Pensé pour les structures qui refusent les outils ternes</h2>
          <p className="max-w-3xl text-sm leading-7 text-white/58">
            Freelances, consultants, agences, cabinets, studios, micro-entrepreneurs et PME de services qui veulent un outil clair, crédible et beau.
          </p>
        </div>
        <FeatureGrid items={marketingFeatures} />
      </section>

      <section className="container-app grid gap-6 py-14 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Réforme</p>
            <h2 className="text-3xl font-semibold text-white">
              Une interface pédagogique, sans confusion réglementaire
            </h2>
            <p className="text-sm leading-7 text-white/58">
              Noxentis rappelle clairement qu'un simple PDF ne suffit pas comme facture électronique structurée et positionne le produit comme une solution compatible reliée à un partenaire agréé.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">Relances & cash</p>
            <h2 className="text-3xl font-semibold text-white">
              Le suivi de trésorerie devient lisible, immédiat et rassurant
            </h2>
            <p className="text-sm leading-7 text-white/58">
              Relances avant échéance, à l'échéance et après retard, statuts de paiement, marquage payé et projection d'encaissement dans une même vue.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="container-app scroll-mt-28 space-y-8 py-14" id="pricing">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Pricing</p>
          <h2 className="text-4xl font-semibold text-white">Une offre lisible, premium et business</h2>
        </div>
        <PricingGrid plans={pricingPlans} />
      </section>

      <section className="container-app space-y-8 py-14">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">FAQ</p>
          <h2 className="text-4xl font-semibold text-white">Questions fréquentes</h2>
        </div>
        <FaqList items={faqItems} />
      </section>
    </main>
  );
}
