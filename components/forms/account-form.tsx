"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/domain/models";
import { accountSchema } from "@/lib/domain/validators";

type Values = z.infer<typeof accountSchema>;

export function AccountForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      notifications: true
    }
  });

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const response = await fetch("/api/account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
          });

          const payload = (await response.json()) as { ok: boolean; message?: string };
          setSaved(payload.ok ? "Compte mis a jour." : payload.message || "Impossible de mettre a jour le compte.");

          if (payload.ok) {
            router.refresh();
          }
        });
      })}
    >
      <div className="space-y-2">
        <Label>Prenom</Label>
        <Input {...register("firstName")} />
      </div>
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input {...register("lastName")} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input {...register("email")} />
      </div>
      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <label className="flex items-center gap-3 text-sm text-white/72">
          <input type="checkbox" className="h-4 w-4 rounded" {...register("notifications")} />
          Recevoir les alertes conformite, paiements et relances
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Mise a jour..." : "Mettre a jour"}
        </Button>
      </div>
      {saved ? <p className="md:col-span-2 text-sm text-emerald-300">{saved}</p> : null}
    </form>
  );
}
