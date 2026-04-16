"use client";

import { useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/domain/validators";

type ForgotValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "clara@maisonserein.fr"
    }
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { ok: boolean };
      setMessage(
        payload.ok
          ? "Lien de réinitialisation simulé envoyé. Votre espace reste accessible."
          : "Impossible d'initier la réinitialisation."
      );
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email professionnel</Label>
        <Input id="forgot-email" type="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      </div>

      {message ? <p className="text-sm text-white/60">{message}</p> : null}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Envoi..." : "Recevoir un lien sécurisé"}
      </Button>
    </form>
  );
}
