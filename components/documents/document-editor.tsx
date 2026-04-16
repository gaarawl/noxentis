"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateDocumentTotals, formatCurrency } from "@/lib/domain/calculations";
import { invoiceEditorSchema, quoteEditorSchema } from "@/lib/domain/validators";

type QuoteValues = z.infer<typeof quoteEditorSchema>;
type InvoiceValues = z.infer<typeof invoiceEditorSchema>;

type DocumentEditorProps =
  | {
      kind: "quote";
      defaultValues: QuoteValues;
      customerOptions: Array<{ id: string; label: string }>;
    }
  | {
      kind: "invoice";
      defaultValues: InvoiceValues;
      customerOptions: Array<{ id: string; label: string }>;
    };

export function DocumentEditor(props: DocumentEditorProps) {
  const [saved, setSaved] = useState(false);
  const schema = props.kind === "quote" ? quoteEditorSchema : invoiceEditorSchema;
  const form = useForm<QuoteValues | InvoiceValues>({
    resolver: zodResolver(schema),
    defaultValues: props.defaultValues
  });

  const { register, control, handleSubmit, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines"
  });
  const lines = watch("lines");
  const totals = calculateDocumentTotals(lines);

  return (
    <form className="grid gap-6 xl:grid-cols-[1.35fr,0.75fr]" onSubmit={handleSubmit(() => setSaved(true))}>
      <Card>
        <CardHeader>
          <CardTitle>
            {props.kind === "quote" ? "Éditeur de devis" : "Éditeur de facture"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Numéro</Label>
              <Input {...register("number")} />
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select {...register("customerId")}>
                {props.customerOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date d'émission</Label>
              <Input type="date" {...register("issueDate")} />
            </div>
            <div className="space-y-2">
              <Label>{props.kind === "quote" ? "Date d'expiration" : "Échéance"}</Label>
              <Input
                type="date"
                {...register(props.kind === "quote" ? "expiryDate" : "dueDate")}
              />
            </div>
            {props.kind === "invoice" ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Nature de l'opération</Label>
                <Select {...register("operationType")}>
                  <option value="SERVICE">Prestations de services</option>
                  <option value="PRODUCT">Livraisons de biens</option>
                  <option value="MIXED">Mixte</option>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-[0.18em] text-white/42">Lignes</h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  append({
                    id: `line-${fields.length + 1}`,
                    label: "Nouvelle ligne",
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    taxRate: 20,
                    discount: 0,
                    total: 0
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:grid-cols-12"
                >
                  <div className="space-y-2 md:col-span-4">
                    <Label>Libellé</Label>
                    <Input {...register(`lines.${index}.label` as const)} />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      step="1"
                      {...register(`lines.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Prix unitaire HT</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.unitPrice` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>TVA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.taxRate` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-10">
                    <Label>Description</Label>
                    <Input {...register(`lines.${index}.description` as const)} />
                  </div>
                  <div className="flex items-end justify-end md:col-span-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/65 transition hover:text-rose-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea className="min-h-[120px]" {...register("notes")} />
          </div>
          {props.kind === "quote" ? (
            <div className="space-y-2">
              <Label>Conditions</Label>
              <Textarea className="min-h-[100px]" {...register("terms")} />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">
              La facture sera préparée avec ses mentions visuelles premium, puis pourra être transmise via l'adaptateur partenaire PDP si la connexion est active.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Aperçu financier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Sous-total HT</span>
              <span className="text-white">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>TVA</span>
              <span className="text-white">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-4 text-base font-semibold text-white">
              <span>Total TTC</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">
              Le PDF visuel et le flux électronique structuré sont traités séparément dans Noxentis.
            </div>
            <Button className="w-full" type="submit">
              {props.kind === "quote" ? "Enregistrer le devis" : "Enregistrer la facture"}
            </Button>
            {saved ? <p className="text-sm text-emerald-300">Document enregistré en mode démo.</p> : null}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
