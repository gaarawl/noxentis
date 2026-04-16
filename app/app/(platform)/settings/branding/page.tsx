import { BrandingForm } from "@/components/forms/branding-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export default function BrandingSettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Branding"
        title="Une image cohérente sur vos PDF et emails"
        description="Réglez la signature visuelle, les footers, les tonalités et l'élégance globale de vos documents."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Préférences visuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandingForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aperçu PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[28px] border border-white/8 bg-neutral-50 p-8 text-black shadow-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-black/35">Facture premium</p>
              <div className="mt-8 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">Maison Serein Studio</h3>
                  <p className="mt-2 text-sm text-black/65">18 rue du Faubourg Poissonnière, Paris</p>
                </div>
                <p className="text-sm font-medium">FAC-2026-124</p>
              </div>
              <div className="mt-12 space-y-3 border-t border-black/10 pt-6 text-sm text-black/70">
                <p>Audit conformité et design documentaire</p>
                <p>Total TTC : 2 640,00 €</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
