import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCompanyCompleteness, getComplianceOverview } from "@/lib/services/compliance-service";

export default async function CompliancePage() {
  const [overview, completeness] = await Promise.all([
    getComplianceOverview(),
    getCompanyCompleteness()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Conformité"
        title="Préparation réforme, sans opacité"
        description="Checklist claire, niveau de préparation, nouvelles mentions obligatoires et connexion partenaire PDP dans une expérience pédagogique mais haut de gamme."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score de préparation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm text-white/42">Readiness</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-5xl font-semibold text-white">{overview.score}</p>
                <Badge variant={overview.readiness === "READY" ? "success" : "warning"}>
                  {overview.readiness}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              {completeness.requiredMentions.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-white/65">{item.label}</span>
                  <Badge variant={item.ok ? "success" : "danger"}>{item.ok ? "OK" : "À compléter"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist & calendrier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {overview.timeline.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-white/45">{item.date}</p>
                  </div>
                  <Badge variant={item.state === "active" ? "warning" : item.state === "done" ? "success" : "outline"}>
                    {item.state}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-white">Champs à compléter</p>
                {overview.missingFields.map((item) => (
                  <p key={item} className="text-sm text-white/58">
                    • {item}
                  </p>
                ))}
              </div>
              <div className="space-y-3 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-white">Prochaines étapes</p>
                {overview.nextSteps.map((item) => (
                  <p key={item} className="text-sm text-white/58">
                    • {item}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
