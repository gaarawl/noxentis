"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { companyProfileSchema } from "@/lib/domain/validators";
import type { Company } from "@/lib/domain/models";

type Values = z.infer<typeof companyProfileSchema>;

export function CompanyProfileForm({ company }: { company: Company }) {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      legalName: company.legalName,
      brandName: company.brandName,
      siren: company.siren,
      vatNumber: company.vatNumber,
      address: company.address,
      city: company.city,
      postalCode: company.postalCode,
      country: company.country,
      email: company.email,
      phone: company.phone,
      activityLabel: company.activityLabel,
      paymentTerms: company.paymentTerms,
      tvaOnDebits: company.tvaOnDebits
    }
  });

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const response = await fetch("/api/company", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
          });

          const payload = (await response.json()) as { ok: boolean; message?: string };
          setSaved(
            payload.ok
              ? "Préférences entreprise mises à jour."
              : payload.message || "Impossible d'enregistrer la société."
          );

          if (payload.ok) {
            router.refresh();
          }
        });
      })}
    >
      <div className="space-y-2">
        <Label>Raison sociale</Label>
        <Input {...register("legalName")} />
      </div>
      <div className="space-y-2">
        <Label>Nom de marque</Label>
        <Input {...register("brandName")} />
      </div>
      <div className="space-y-2">
        <Label>SIREN</Label>
        <Input {...register("siren")} />
      </div>
      <div className="space-y-2">
        <Label>TVA intracommunautaire</Label>
        <Input {...register("vatNumber")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Adresse</Label>
        <Textarea className="min-h-[96px]" {...register("address")} />
      </div>
      <div className="space-y-2">
        <Label>Ville</Label>
        <Input {...register("city")} />
      </div>
      <div className="space-y-2">
        <Label>Code postal</Label>
        <Input {...register("postalCode")} />
      </div>
      <div className="space-y-2">
        <Label>Pays</Label>
        <Input {...register("country")} />
      </div>
      <div className="space-y-2">
        <Label>Email finance</Label>
        <Input {...register("email")} />
      </div>
      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label>Activité</Label>
        <Input {...register("activityLabel")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Conditions de paiement</Label>
        <Textarea className="min-h-[96px]" {...register("paymentTerms")} />
      </div>
      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <label className="flex items-center gap-3 text-sm text-white/72">
          <input type="checkbox" className="h-4 w-4 rounded" {...register("tvaOnDebits")} />
          Option pour le paiement de la TVA d'après les débits
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
      {saved ? <p className="md:col-span-2 text-sm text-emerald-300">{saved}</p> : null}
    </form>
  );
}
