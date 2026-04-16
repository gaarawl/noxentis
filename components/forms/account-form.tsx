"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { accountSchema } from "@/lib/domain/validators";
import type { SessionUser } from "@/lib/domain/models";

type Values = z.infer<typeof accountSchema>;

export function AccountForm({ user }: { user: SessionUser }) {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      notifications: true
    }
  });

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(() => setSaved(true))}>
      <div className="space-y-2">
        <Label>Prénom</Label>
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
      <div className="space-y-2">
        <Label>Rôle</Label>
        <Select {...register("role")}>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
        </Select>
      </div>
      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <label className="flex items-center gap-3 text-sm text-white/72">
          <input type="checkbox" className="h-4 w-4 rounded" {...register("notifications")} />
          Recevoir les alertes conformité, paiements et relances
        </label>
        <Button type="submit">Mettre à jour</Button>
      </div>
      {saved ? <p className="md:col-span-2 text-sm text-emerald-300">Compte mis à jour.</p> : null}
    </form>
  );
}
