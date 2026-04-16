import { PricingGrid } from "@/components/marketing/pricing-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getBillingOverview } from "@/lib/services/billing-service";

export default function BillingPage() {
  const billing = getBillingOverview();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Abonnement"
        title="Plans, essai et montée en gamme"
        description="Préparez un billing propre avec Stripe, essais gratuits et structure de plans adaptée aux petites et moyennes équipes."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Abonnement actif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <span className="text-sm text-white/52">Plan actuel</span>
              <Badge variant="success">{billing.activePlan}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <span className="text-sm text-white/52">Fin d'essai</span>
              <span className="text-white">{billing.trialEndsAt}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <span className="text-sm text-white/52">Prochaine échéance</span>
              <span className="text-white">{billing.nextInvoiceAmount}</span>
            </div>
          </CardContent>
        </Card>

        <PricingGrid plans={billing.pricingPlans} />
      </div>
    </div>
  );
}
