import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatPercent } from "@/lib/domain/calculations";
import { getDashboardSnapshot } from "@/lib/services/dashboard-service";

export default function DashboardPage() {
  const snapshot = getDashboardSnapshot();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Dashboard"
        title="Pilotage business premium"
        description="Chiffre d'affaires, encaissements, relances, conformité et activité récente dans une interface noir sur noir pensée pour une vraie exploitation quotidienne."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {snapshot.kpis.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenus et encaissements</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={snapshot.chart} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lecture rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="text-sm text-white/55">Trésorerie attendue</span>
                <span className="text-lg font-semibold text-white">
                  {formatCurrency(snapshot.cashExpected)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="text-sm text-white/55">Relances à faire</span>
                <span className="text-lg font-semibold text-white">
                  {snapshot.remindersToSend}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="text-sm text-white/55">Conversion devis → facture</span>
                <span className="text-lg font-semibold text-white">
                  {formatPercent(snapshot.conversionRate)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préparation conformité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/58">
              <p>
                Le produit distingue explicitement le PDF visuel du flux structuré transmis via
                partenaire PDP.
              </p>
              <p>
                Les nouvelles mentions réglementaires sont prévues dans les modèles et le workflow
                de validation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline récente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline items={snapshot.recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
