import { AccountForm } from "@/components/forms/account-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentSession } from "@/lib/services/auth-service";

export default async function AccountSettingsPage() {
  const user = await getCurrentSession();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Compte"
        title="Préférences utilisateur"
        description="Profil, notifications, rôle et organisation du compte principal."
      />
      <Card>
        <CardHeader>
        <CardTitle>Compte principal</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
