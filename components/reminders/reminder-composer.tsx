"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/domain/calculations";
import type { ReminderType, RemindableInvoiceRow } from "@/lib/domain/models";

type ReminderMode = "SCHEDULE" | "SEND";

const reminderTypeLabels: Record<ReminderType, string> = {
  PRE_DUE: "Avant echeance",
  DUE_DATE: "Jour d'echeance",
  OVERDUE: "Retard"
};

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getDefaultScheduledDate(invoice: RemindableInvoiceRow, type: ReminderType) {
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();

  if (type === "PRE_DUE") {
    const preferred = new Date(dueDate);
    preferred.setDate(preferred.getDate() - 3);
    return toIsoDate(preferred > today ? preferred : today);
  }

  if (type === "DUE_DATE") {
    return toIsoDate(dueDate > today ? dueDate : today);
  }

  return toIsoDate(today);
}

function getDefaultSubject(invoiceNumber: string, type: ReminderType) {
  if (type === "PRE_DUE") {
    return `Rappel premium avant l'echeance de ${invoiceNumber}`;
  }

  if (type === "DUE_DATE") {
    return `Votre facture ${invoiceNumber} arrive a echeance aujourd'hui`;
  }

  return `Relance premium pour la facture ${invoiceNumber}`;
}

export function ReminderComposer({ invoices }: { invoices: RemindableInvoiceRow[] }) {
  const router = useRouter();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || "");
  const [type, setType] = useState<ReminderType>(invoices[0]?.recommendedReminderType || "PRE_DUE");
  const [mode, setMode] = useState<ReminderMode>("SCHEDULE");
  const [scheduledAt, setScheduledAt] = useState(() =>
    invoices[0] ? getDefaultScheduledDate(invoices[0], invoices[0].recommendedReminderType) : toIsoDate(new Date())
  );
  const [subject, setSubject] = useState(
    invoices[0]
      ? getDefaultSubject(invoices[0].number, invoices[0].recommendedReminderType)
      : ""
  );
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

    setType(selectedInvoice.recommendedReminderType);
  }, [selectedInvoice]);

  useEffect(() => {
    if (!selectedInvoice) {
      return;
    }

    setScheduledAt(getDefaultScheduledDate(selectedInvoice, type));
    setSubject(getDefaultSubject(selectedInvoice.number, type));
  }, [selectedInvoice, type]);

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.18em] text-white/42">Factures a relancer</h3>
          <p className="text-sm text-white/45">{invoices.length} ouvertes</p>
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
                  <p className="text-xs uppercase tracking-[0.18em] text-white/35">Reste</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(invoice.remainingAmount)}
                  </p>
                </div>
              </div>
              {invoice.lastReminderAt ? (
                <div className="mt-3 border-t border-white/8 pt-3 text-xs text-white/42">
                  Derniere relance {invoice.lastReminderType} - {invoice.lastReminderStatus} -{" "}
                  {formatDate(invoice.lastReminderAt)}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.18em] text-white/38">Composer une relance</p>
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
                const response = await fetch("/api/reminders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    invoiceId: selectedInvoice.id,
                    type,
                    mode,
                    scheduledAt,
                    subject
                  })
                });

                const payload = (await response.json()) as {
                  ok: boolean;
                  message?: string;
                  data?: { invoiceNumber?: string; status?: string };
                };

                setMessage(
                  payload.ok
                    ? mode === "SEND"
                      ? `Relance envoyee pour ${payload.data?.invoiceNumber || "la facture"}.`
                      : `Relance programmee pour ${payload.data?.invoiceNumber || "la facture"}.`
                    : payload.message || "Relance impossible."
                );

                if (payload.ok) {
                  router.refresh();
                }
              } catch {
                setMessage("Relance impossible pour le moment.");
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label>Type de relance</Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(reminderTypeLabels) as Array<[ReminderType, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm transition",
                    type === value
                      ? "border-white/18 bg-white/[0.08] text-white"
                      : "border-white/8 bg-white/[0.03] text-white/60 hover:border-white/14 hover:text-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "SCHEDULE" as const, label: "Programmer" },
                { value: "SEND" as const, label: "Envoyer maintenant" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm transition",
                    mode === option.value
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
            <Label>Date de relance</Label>
            <Input
              type="date"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Objet</Label>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/30 p-4 text-sm text-white/55">
            {selectedInvoice ? (
              <div className="space-y-2">
                <p>Facture ouverte : {formatCurrency(selectedInvoice.total)}</p>
                <p>Solde relance : {formatCurrency(selectedInvoice.remainingAmount)}</p>
              </div>
            ) : (
              <span>Selectionnez une facture pour preparer une relance.</span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            variant={mode === "SEND" ? "premium" : "secondary"}
            disabled={isPending || !selectedInvoice}
          >
            {isPending
              ? mode === "SEND"
                ? "Envoi..."
                : "Programmation..."
              : mode === "SEND"
                ? "Envoyer la relance"
                : "Programmer la relance"}
          </Button>
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
