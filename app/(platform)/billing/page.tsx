import { ArrowRight, CreditCard, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";
import { billingPlanCatalog } from "@/lib/config/billing";
import type { BillingStatus, PlanTier } from "@/lib/domain/models";
import { getBillingOverview } from "@/lib/services/billing-service";

function statusVariant(status: BillingStatus) {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "TRIALING") {
    return "warning";
  }

  if (status === "PAST_DUE" || status === "INCOMPLETE") {
    return "danger";
  }

  return "outline";
}

function readString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function buildFlashMessage(params: {
  checkout?: string;
  portal?: string;
  plan?: string;
}) {
  if (params.checkout === "success") {
    return {
      title: "Abonnement mis a jour",
      description: "Le retour Stripe a ete synchronise avec votre cockpit billing.",
      tone: "success" as const
    };
  }

  if (params.checkout === "preview") {
    return {
      title: "Plan simule en mode preview",
      description: `Le plan ${params.plan || "selectionne"} a ete applique sans paiement Stripe pour vous laisser avancer pendant la configuration.`,
      tone: "warning" as const
    };
  }

  if (params.checkout === "cancelled") {
    return {
      title: "Checkout interrompu",
      description: "Aucun changement payant n'a ete applique. Votre abonnement actuel reste conserve.",
      tone: "outline" as const
    };
  }

  if (params.checkout === "error") {
    return {
      title: "Impossible de lancer le checkout",
      description: "Verifiez le plan choisi ou la configuration Stripe avant de reessayer.",
      tone: "danger" as const
    };
  }

  if (params.portal === "preview") {
    return {
      title: "Portail client en attente",
      description: "Le portail Stripe n'est pas encore configure. Le cockpit reste en mode preview billing.",
      tone: "warning" as const
    };
  }

  if (params.portal === "return") {
    return {
      title: "Retour du portail billing",
      description: "Les changements effectues dans Stripe seront repris sur votre prochaine ouverture du module abonnement.",
      tone: "success" as const
    };
  }

  return null;
}

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const checkout = readString(params.checkout);
  const portal = readString(params.portal);
  const plan = readString(params.plan);
  const sessionId = readString(params.session_id);
  const billing = await getBillingOverview({
    checkoutSessionId: checkout === "success" ? sessionId : undefined
  });
  const flash = buildFlashMessage({ checkout, portal, plan });

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Abonnement"
        title="Billing premium, plans et essai gratuit"
        description="Pilotez vos plans Solo, Pro et Business avec un essai de 14 jours, une bascule Stripe propre et un fallback preview tant que la couche paiement n'est pas finalisee."
      />

      {flash ? (
        <Card className="border-white/12">
          <CardContent className="flex items-start justify-between gap-4 pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant={flash.tone}>{flash.title}</Badge>
                <span className="text-xs uppercase tracking-[0.2em] text-white/35">
                  {billing.supportModeLabel}
                </span>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-white/64">{flash.description}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Console abonnement</CardTitle>
            <CardDescription>
              Etat actuel, mode de facturation et point de sortie vers Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">Plan actif</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-white">
                    {billing.activePlan}
                  </p>
                  <Badge variant="success">{billing.nextInvoiceAmount} / mois</Badge>
                </div>
                <p className="mt-3 text-sm text-white/58">
                  {billingPlanCatalog[billing.activePlan].description}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">Etat</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                    {billing.statusLabel}
                  </p>
                  <Badge variant={statusVariant(billing.subscription.status)}>
                    {billing.supportModeLabel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-white/58">
                  {billing.subscription.cancelAtPeriodEnd
                    ? "La resiliation a ete demandee pour la fin de periode."
                    : "Le plan reste actif et peut etre ajuste a tout moment."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/52">Fin d'essai</p>
                <p className="mt-2 text-lg font-semibold text-white">{billing.trialEndsAtLabel}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                  {billing.trialDaysRemaining > 0
                    ? `${billing.trialDaysRemaining} jour${billing.trialDaysRemaining > 1 ? "s" : ""} restants`
                    : "Essai termine"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/52">Prochaine periode</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {billing.currentPeriodEndLabel}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                  Facturation mensuelle
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/52">Capacite incluse</p>
                <p className="mt-2 text-lg font-semibold text-white">{billing.seatsLabel}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                  Stack billing pret
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 text-sm text-white/66">
                <CreditCard className="h-4 w-4 text-white/48" />
                <span>
                  {billing.mode === "stripe"
                    ? "Stripe est actif pour le checkout et le portail client."
                    : "Le projet reste exploitable en mode preview tant que les prix Stripe ne sont pas tous branches."}
                </span>
              </div>

              <form action="/api/billing/portal" method="post" className="ml-auto">
                <Button
                  variant={billing.canManagePortal ? "secondary" : "ghost"}
                  size="sm"
                  type="submit"
                >
                  {billing.canManagePortal ? "Gerer dans Stripe" : "Portail preview"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plans disponibles</CardTitle>
            <CardDescription>
              Chaque palier garde une presentation premium, tout en renforcant la couche SaaS.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            {billing.pricingPlans.map((pricingPlan) => {
              const isCurrent = billing.activePlan === pricingPlan.name;
              const catalogEntry = billingPlanCatalog[pricingPlan.name];

              return (
                <div
                  key={pricingPlan.name}
                  className={cn(
                    "rounded-[28px] border p-5",
                    isCurrent
                      ? "border-white/14 bg-[linear-gradient(180deg,rgba(30,34,38,0.95),rgba(10,11,14,0.94))]"
                      : "border-white/8 bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={isCurrent ? "success" : pricingPlan.highlight ? "warning" : "outline"}>
                      {isCurrent ? "Actuel" : pricingPlan.highlight ? "Recommande" : pricingPlan.name}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-white/30">
                      {catalogEntry.seatsLabel}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                      {pricingPlan.name}
                    </h3>
                    <p className="text-sm leading-6 text-white/58">{pricingPlan.description}</p>
                    <p className="text-3xl font-semibold tracking-[-0.04em] text-white">
                      {pricingPlan.priceMonthly}
                      <span className="text-sm font-normal text-white/40"> / mois</span>
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {pricingPlan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-white/68">
                        <Sparkles className="mt-0.5 h-4 w-4 text-white/50" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <form action="/api/billing/checkout" method="post" className="mt-6">
                    <input type="hidden" name="plan" value={pricingPlan.name} />
                    <Button
                      className="w-full gap-2"
                      variant={isCurrent ? "secondary" : pricingPlan.highlight ? "premium" : "primary"}
                      type="submit"
                      disabled={isCurrent}
                    >
                      {isCurrent ? "Conserver ce plan" : `Passer sur ${pricingPlan.name}`}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
