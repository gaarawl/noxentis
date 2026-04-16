import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">Connexion</CardTitle>
        <p className="text-sm text-white/58">
          Entrez dans votre cockpit premium de facturation électronique.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <LoginForm />
        <div className="flex items-center justify-between text-sm text-white/42">
          <Link href="/forgot-password" className="hover:text-white">
            Mot de passe oublié
          </Link>
          <Link href="/register" className="hover:text-white">
            Créer un compte
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
