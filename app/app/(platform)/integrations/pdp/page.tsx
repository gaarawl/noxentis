import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getPdpOverview } from "@/lib/services/pdp-service";

export default async function PdpIntegrationsPage() {
  const overview = await getPdpOverview();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Intégrations PDP"
        title="Couche de connectivité réglementaire"
        description="Noxentis reste le cockpit business premium ; la transmission et la récupération des statuts passent par des partenaires habilités."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Connecteurs disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.providers.map((provider) => (
              <div key={provider.slug} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{provider.name}</p>
                    <p className="mt-1 text-sm text-white/52">{provider.description}</p>
                  </div>
                  <Badge variant={provider.status === "ready" ? "success" : provider.status === "pilot" ? "warning" : "outline"}>
                    {provider.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapping de statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.statusMapping.map((item) => (
              <div key={item.internal} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-sm font-medium text-white">{item.internal}</span>
                <span className="text-sm text-white/48">{item.partner}</span>
              </div>
            ))}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">
              La V1 inclut un mode simulation pour préparer l'expérience, les écrans et le journal de statuts avant branchement API réel.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
