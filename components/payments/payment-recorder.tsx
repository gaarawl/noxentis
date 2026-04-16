"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/domain/calculations";
import type { PaymentMethod, ReceivableInvoiceRow } from "@/lib/domain/models";

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "TRANSFER", label: "Virement" },
  { value: "CARD", label: "Carte" },
  { value: "SEPA", label: "SEPA" },
  { value: "CASH", label: "Especes" }
];

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function PaymentRecorder({ invoices }: { invoices: ReceivableInvoiceRow[] }) {
  const router = useRouter();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("TRANSFER");
  const [paidAt, setPaidAt] = useState(() => toIsoDate(new Date()));
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  );

  useEffect(() => {
    if (!selectedInvoice) {
      return;
    }

    setAmount(selectedInvoice.remainingAmount.toFixed(2));
  }, [selectedInvoice]);

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.18em] text-white/42">Factures a encaisser</h3>
          <p className="text-sm text-white/45">{invoices.length} en attente</p>
        </div>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              onClick={() => setSelectedInvoiceId(invoice.id)}
              className={cn(
                "w-full rounded-3xl border px-5 py-4 text-left transition",
                selectedInvoiceId === invoice.id
                  ? "border-white/20 bg-white/[0.08] shadow-[0_12px_30px_rgba(255,255,255,0.04)]"
                  : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{invoice.number}</p>
                  <p className="text-sm text-white/55">{invoice.customerName}</p>
                  <p className="text-xs text-white/38">Echeance {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/35">Solde</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(invoice.remainingAmount)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.18em] text-white/38">Enregistrer un paiement</p>
          <h3 className="text-2xl font-semibold text-white">
            {selectedInvoice ? selectedInvoice.number : "Selectionnez une facture"}
          </h3>
          {selectedInvoice ? (
            <p className="text-sm text-white/55">
              {selectedInvoice.customerName} - reste {formatCurrency(selectedInvoice.remainingAmount)}
            </p>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedInvoice) {
              return;
            }

            startTransition(async () => {
              try {
                const response = await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    invoiceId: selectedInvoice.id,
                    amount: Number(amount),
                    method,
                    paidAt,
                    reference
                  })
                });

                const payload = (await response.json()) as {
                  ok: boolean;
                  message?: string;
                  data?: { invoiceNumber?: string; remainingAmount?: number };
                };

                setMessage(
                  payload.ok
                    ? `Paiement enregistre sur ${payload.data?.invoiceNumber || "la facture"}.`
                    : payload.message || "Paiement impossible."
                );

                if (payload.ok) {
                  router.refresh();
                }
              } catch {
                setMessage("Paiement impossible pour le moment.");
              }
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Montant encaisse</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de paiement</Label>
              <Input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Methode</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMethod(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm transition",
                    method === option.value
                      ? "border-white/18 bg-white/[0.08] text-white"
                      : "border-white/8 bg-white/[0.03] text-white/60 hover:border-white/14 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reference</Label>
            <Input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Ex. Virement Qonto, CB client, remise comptable"
            />
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/30 p-4 text-sm text-white/55">
            {selectedInvoice ? (
              <div className="flex items-center justify-between gap-4">
                <span>Total facture {formatCurrency(selectedInvoice.total)}</span>
                <span>Deja encaisse {formatCurrency(selectedInvoice.paidAmount)}</span>
              </div>
            ) : (
              <span>Selectionnez une facture pour renseigner son encaissement.</span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="premium"
            disabled={isPending || !selectedInvoice}
          >
            {isPending ? "Enregistrement..." : "Enregistrer le paiement"}
          </Button>
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
