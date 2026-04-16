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
import { cn } from "@/lib/cn";
import { customerSchema } from "@/lib/domain/validators";

type Values = z.infer<typeof customerSchema>;

const customerTypes = [
  {
    value: "COMPANY" as const,
    label: "Entreprise",
    description: "Societe, agence, cabinet, TPE ou PME"
  },
  {
    value: "INDIVIDUAL" as const,
    label: "Particulier",
    description: "Freelance, independant ou client personne physique"
  }
];

export function CustomerForm() {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, watch, setValue } = useForm<Values>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: "COMPANY",
      legalName: "",
      contactName: "",
      email: "",
      phone: "",
      siren: "",
      vatNumber: "",
      billingAddressLine1: "",
      billingCity: "",
      billingPostalCode: "",
      notes: "",
      tags: ""
    }
  });
  const selectedType = watch("type");

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
          setSaved(
            payload.ok ? "Client enregistre." : payload.message || "Impossible d'ajouter ce client."
          );

          if (payload.ok) {
            router.refresh();
          }
        });
      })}
    >
      <input type="hidden" {...register("type")} />

      <div className="space-y-3">
        <Label>Type de client</Label>
        <div className="grid gap-3 md:grid-cols-2">
          {customerTypes.map((type) => {
            const active = selectedType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setValue("type", type.value, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
                className={cn(
                  "rounded-[26px] border px-4 py-4 text-left transition",
                  active
                    ? "border-white/20 bg-white/[0.08] shadow-[0_16px_32px_rgba(255,255,255,0.05)]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
                )}
              >
                <p className={cn("font-medium", active ? "text-white" : "text-white/78")}>
                  {type.label}
                </p>
                <p className="mt-1 text-sm text-white/45">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nom</Label>
        <Input placeholder="Ex. Atelier Monceau" {...register("legalName")} />
      </div>
      <div className="space-y-2">
        <Label>Contact</Label>
        <Input placeholder="Ex. Claire Dupont" {...register("contactName")} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input placeholder="contact@entreprise.fr" {...register("email")} />
      </div>
      <div className="space-y-2">
        <Label>Telephone</Label>
        <Input placeholder="+33 6 00 00 00 00" {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label>SIREN</Label>
        <Input placeholder="123456789" {...register("siren")} />
      </div>
      <div className="space-y-2">
        <Label>Adresse de facturation</Label>
        <Textarea
          className="min-h-[96px]"
          placeholder="12 rue de la Paix"
          {...register("billingAddressLine1")}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Ville</Label>
          <Input placeholder="Paris" {...register("billingCity")} />
        </div>
        <div className="space-y-2">
          <Label>Code postal</Label>
          <Input placeholder="75002" {...register("billingPostalCode")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <Input placeholder="Premium, 30 jours, Cabinet" {...register("tags")} />
      </div>
      <div className="space-y-2">
        <Label>Notes internes</Label>
        <Textarea
          className="min-h-[96px]"
          placeholder="Contexte commercial, habitudes de paiement, remarques utiles..."
          {...register("notes")}
        />
      </div>
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter ce client"}
      </Button>
      {saved ? <p className="text-sm text-emerald-300">{saved}</p> : null}
    </form>
  );
}
