import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatPercent } from "@/lib/domain/calculations";
import { getCompanyCompleteness, getComplianceOverview } from "@/lib/services/compliance-service";
import { getDashboardSnapshot } from "@/lib/services/dashboard-service";

function getReadinessLabel(status: "READY" | "PARTIALLY_READY" | "NOT_READY") {
  if (status === "READY") {
    return "Pret";
  }

  if (status === "PARTIALLY_READY") {
    return "Partiellement pret";
  }

  return "Non pret";
}

export default async function DashboardPage() {
  const [snapshot, overview, completeness] = await Promise.all([
    getDashboardSnapshot(),
    getComplianceOverview(),
    getCompanyCompleteness()
  ]);
  const readyMentions = completeness.requiredMentions.filter((item) => item.ok).length;
  const readinessVariant =
    overview.readiness === "READY"
      ? "success"
      : overview.readiness === "PARTIALLY_READY"
        ? "warning"
        : "danger";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Dashboard"
        title="Pilotage business premium"
        description="Chiffre d'affaires, encaissements, relances, conformite et activite recente dans une interface noir sur noir pensee pour une vraie exploitation quotidienne."
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
                <span className="text-sm text-white/55">Tresorerie attendue</span>
                <span className="text-lg font-semibold text-white">
                  {formatCurrency(snapshot.cashExpected)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="text-sm text-white/55">Relances a faire</span>
                <span className="text-lg font-semibold text-white">
                  {snapshot.remindersToSend}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="text-sm text-white/55">Conversion devis -&gt; facture</span>
                <span className="text-lg font-semibold text-white">
                  {formatPercent(snapshot.conversionRate)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preparation conformite</CardTitle>
              <Badge variant={readinessVariant}>{getReadinessLabel(overview.readiness)}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/62">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span className="text-white/55">PDP partenaire</span>
                  <span className="font-medium text-white">
                    {completeness.pdpConnected ? "Connectee" : "A connecter"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span className="text-white/55">Mentions controlees</span>
                  <span className="font-medium text-white">
                    {readyMentions}/{completeness.requiredMentions.length}
                  </span>
                </div>
              </div>

              {overview.missingFields.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-medium text-white">Priorites a completer</p>
                  {overview.missingFields.slice(0, 3).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-4 text-emerald-100">
                  Votre espace est structure pour une transmission electronique dans de bonnes
                  conditions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline recente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline items={snapshot.recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
