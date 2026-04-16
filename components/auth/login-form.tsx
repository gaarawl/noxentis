"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/domain/validators";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { ok: boolean; message?: string; redirectTo?: string };
      if (!payload.ok) {
        setMessage(payload.message || "Impossible de vous connecter.");
        return;
      }

      router.push(payload.redirectTo || "/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email professionnel</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password ? (
          <p className="text-sm text-rose-300">{errors.password.message}</p>
        ) : null}
      </div>

      {message ? <p className="text-sm text-rose-300">{message}</p> : null}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Connexion..." : "Accéder au cockpit"}
      </Button>
    </form>
  );
}
