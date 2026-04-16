"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { customerSchema } from "@/lib/domain/validators";

type Values = z.infer<typeof customerSchema>;

export function CustomerForm() {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: "COMPANY",
      legalName: "Nouvelle structure",
      contactName: "Nom contact",
      email: "contact@entreprise.fr",
      phone: "+33 ",
      siren: "",
      vatNumber: "",
      billingAddressLine1: "",
      billingCity: "Paris",
      billingPostalCode: "75000",
      notes: "",
      tags: "Premium, 30 jours"
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const response = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
          });

          const payload = (await response.json()) as { ok: boolean; message?: string };
          setSaved(payload.ok ? "Client enregistré." : payload.message || "Impossible d'ajouter ce client.");

          if (payload.ok) {
            router.refresh();
          }
        });
      })}
    >
      <div className="space-y-2">
        <Label>Type</Label>
        <Select {...register("type")}>
          <option value="COMPANY">Entreprise</option>
          <option value="INDIVIDUAL">Particulier</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input {...register("legalName")} />
      </div>
      <div className="space-y-2">
        <Label>Contact</Label>
        <Input {...register("contactName")} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input {...register("email")} />
      </div>
      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label>SIREN</Label>
        <Input {...register("siren")} />
      </div>
      <div className="space-y-2">
        <Label>Adresse de facturation</Label>
        <Textarea className="min-h-[96px]" {...register("billingAddressLine1")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Ville</Label>
          <Input {...register("billingCity")} />
        </div>
        <div className="space-y-2">
          <Label>Code postal</Label>
          <Input {...register("billingPostalCode")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <Input {...register("tags")} />
      </div>
      <div className="space-y-2">
        <Label>Notes internes</Label>
        <Textarea className="min-h-[96px]" {...register("notes")} />
      </div>
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter ce client"}
      </Button>
      {saved ? <p className="text-sm text-emerald-300">{saved}</p> : null}
    </form>
  );
}
