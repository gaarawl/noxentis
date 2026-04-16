"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/domain/validators";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { ok: boolean; message?: string; redirectTo?: string };
      if (!payload.ok) {
        setMessage(payload.message || "Impossible de créer le compte.");
        return;
      }

      router.push(payload.redirectTo || "/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="firstName">Prénom</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName ? <p className="text-sm text-rose-300">{errors.firstName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Nom</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName ? <p className="text-sm text-rose-300">{errors.lastName.message}</p> : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="companyName">Structure</Label>
        <Input id="companyName" {...register("companyName")} />
        {errors.companyName ? <p className="text-sm text-rose-300">{errors.companyName.message}</p> : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmation</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword ? (
          <p className="text-sm text-rose-300">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {message ? <p className="md:col-span-2 text-sm text-rose-300">{message}</p> : null}

      <div className="md:col-span-2">
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer mon espace"}
        </Button>
      </div>
    </form>
  );
}
