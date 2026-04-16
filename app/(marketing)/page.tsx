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
          <Badge
            variant="outline"
            className="animate-premium-in"
            style={{ ["--enter-delay" as string]: "90ms" }}
          >
            Compatible reforme 2026/2027 - Connectable PDP partenaire
          </Badge>
          <div
            className="animate-premium-in space-y-5"
            style={{ ["--enter-delay" as string]: "160ms" }}
          >
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/58">
              Un cockpit noir sur noir, haut de gamme et rassurant pour creer vos devis et
              factures, preparer la conformite, transmettre via partenaire agree, piloter vos
              paiements et relancer vos clients avec elegance.
            </p>
          </div>
          <div
            className="animate-premium-in flex flex-wrap gap-3"
            style={{ ["--enter-delay" as string]: "250ms" }}
          >
            <Link href="/register">
              <Button size="lg" variant="premium">
                Demarrer l'essai premium
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
            {[
              {
                label: "Emission & reception",
                value: "Pret pour septembre 2026"
              },
              {
                label: "Relances",
                value: "Automatiques et premium"
              },
              {
                label: "PDP",
                value: "Architecture prete a brancher"
              }
            ].map((item, index) => (
              <Card
                key={item.label}
                className="animate-premium-in"
                style={{ ["--enter-delay" as string]: `${320 + index * 70}ms` }}
              >
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm text-white/42">{item.label}</p>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div
          className="surface animate-premium-panel relative overflow-hidden p-6"
          style={{ ["--enter-delay" as string]: "220ms" }}
        >
          <div className="hero-grid animate-premium-grid absolute inset-0 opacity-40" />
          <div className="relative space-y-5">
            <div
              className="animate-premium-in flex items-center justify-between rounded-3xl border border-white/8 bg-black/35 p-5"
              style={{ ["--enter-delay" as string]: "420ms" }}
            >
              <div>
                <p className="text-sm text-white/45">CA du mois</p>
                <p className="mt-2 text-3xl font-semibold text-white">14 700 EUR</p>
              </div>
              <Badge variant="success">+14 %</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Conformite",
                  description:
                    "Mentions obligatoires verifiees, connexion partenaire active, score 84/100."
                },
                {
                  icon: Wallet,
                  title: "Tresorerie",
                  description:
                    "Encaissements, retards, relances et cash attendu dans une seule vue."
                }
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="animate-premium-in"
                    style={{ ["--enter-delay" as string]: `${500 + index * 90}ms` }}
                  >
                    <CardContent className="space-y-3 p-5">
                      <Icon className="h-5 w-5 text-white/72" />
                      <p className="text-lg font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-white/52">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card
              className="animate-premium-in"
              style={{ ["--enter-delay" as string]: "620ms" }}
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/42">Statut facture FAC-2026-118</p>
                  <Badge variant="success">Transmise</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    {
                      label: "PDF",
                      value: "Document visuel premium"
                    },
                    {
                      label: "Flux",
                      value: "Payload structure prepare"
                    },
                    {
                      label: "PDP",
                      value: "Statut recupere automatiquement"
                    }
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="animate-premium-in rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      style={{ ["--enter-delay" as string]: `${700 + index * 80}ms` }}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-white/32">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm text-white/72">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        className="container-app animate-premium-in space-y-10 py-14"
        style={{ ["--enter-delay" as string]: "220ms" }}
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Pour qui</p>
          <h2 className="text-4xl font-semibold text-white">
            Pense pour les structures qui refusent les outils ternes
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-white/58">
            Freelances, consultants, agences, cabinets, studios, micro-entrepreneurs et PME de
            services qui veulent un outil clair, credible et beau.
          </p>
        </div>
        <FeatureGrid items={marketingFeatures} />
      </section>

      <section className="container-app grid gap-6 py-14 lg:grid-cols-2">
        {[
          {
            eyebrow: "Reforme",
            title: "Une interface pedagogique, sans confusion reglementaire",
            description:
              "Noxentis rappelle clairement qu'un simple PDF ne suffit pas comme facture electronique structuree et positionne le produit comme une solution compatible reliee a un partenaire agree."
          },
          {
            eyebrow: "Relances & cash",
            title: "Le suivi de tresorerie devient lisible, immediat et rassurant",
            description:
              "Relances avant echeance, a l'echeance et apres retard, statuts de paiement, marquage paye et projection d'encaissement dans une meme vue."
          }
        ].map((item, index) => (
          <Card
            key={item.eyebrow}
            className="animate-premium-in"
            style={{ ["--enter-delay" as string]: `${240 + index * 90}ms` }}
          >
            <CardContent className="space-y-4 p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.eyebrow}</p>
              <h2 className="text-3xl font-semibold text-white">{item.title}</h2>
              <p className="text-sm leading-7 text-white/58">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container-app scroll-mt-28 space-y-8 py-14" id="pricing">
        <div
          className="animate-premium-in space-y-3"
          style={{ ["--enter-delay" as string]: "200ms" }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Pricing</p>
          <h2 className="text-4xl font-semibold text-white">
            Une offre lisible, premium et business
          </h2>
        </div>
        <PricingGrid plans={pricingPlans} />
      </section>

      <section className="container-app space-y-8 py-14">
        <div
          className="animate-premium-in space-y-3"
          style={{ ["--enter-delay" as string]: "200ms" }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">FAQ</p>
          <h2 className="text-4xl font-semibold text-white">Questions frequentes</h2>
        </div>
        <FaqList items={faqItems} />
      </section>
    </main>
  );
}
