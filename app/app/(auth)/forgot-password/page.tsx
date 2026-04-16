import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">Réinitialisation</CardTitle>
        <p className="text-sm text-white/58">
          Recevez un lien sécurisé pour reprendre la main sur votre espace.
        </p>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
