"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brandingSchema } from "@/lib/domain/validators";

type Values = z.infer<typeof brandingSchema>;

export function BrandingForm() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<Values>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primarySignature: "Noir graphite et argent discret",
      accentTone: "Bleu nuit froid",
      footerMessage: "Merci pour votre confiance. Cette facture a été générée via Noxentis.",
      logoUrl: "",
      emailSignature: "Clara Martin\nMaison Serein Studio"
    }
  });

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(() => setSaved(true))}>
      <div className="space-y-2">
        <Label>Signature visuelle</Label>
        <Input {...register("primarySignature")} />
      </div>
      <div className="space-y-2">
        <Label>Accent</Label>
        <Input {...register("accentTone")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Logo URL</Label>
        <Input {...register("logoUrl")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Footer PDF</Label>
        <Textarea className="min-h-[96px]" {...register("footerMessage")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Signature email</Label>
        <Textarea className="min-h-[120px]" {...register("emailSignature")} />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        {saved ? <p className="text-sm text-emerald-300">Branding premium mis à jour.</p> : <span />}
        <Button type="submit">Sauvegarder le branding</Button>
      </div>
    </form>
  );
}
