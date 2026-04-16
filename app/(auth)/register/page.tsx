import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">Créer votre espace Noxentis</CardTitle>
        <p className="text-sm text-white/58">
          Démarrez avec un onboarding simple, élégant et prêt pour la réforme.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <RegisterForm />
        <p className="text-sm text-white/42">
          Déjà client ?{" "}
          <Link href="/login" className="hover:text-white">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
