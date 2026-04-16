import { CompanyProfileForm } from "@/components/forms/company-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { demoCompany } from "@/lib/data/demo-data";

export default function CompanySettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Paramètres entreprise"
        title="Votre identité légale et opérationnelle"
        description="Les informations nécessaires à la facturation, aux mentions obligatoires et à la future transmission structurée."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profil société</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm company={demoCompany} />
        </CardContent>
      </Card>
    </div>
  );
}
