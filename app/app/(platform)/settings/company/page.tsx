import { CompanyProfileForm } from "@/components/forms/company-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCompanyProfile } from "@/lib/services/company-service";

export default async function CompanySettingsPage() {
  const company = await getCompanyProfile();

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
          <CompanyProfileForm company={company} />
        </CardContent>
      </Card>
    </div>
  );
}
