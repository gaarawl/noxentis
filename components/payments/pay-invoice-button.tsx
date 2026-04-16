"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function PayInvoiceButton({
  invoiceId,
  amount,
  disabled
}: {
  invoiceId: string;
  amount: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={disabled || isPending || amount <= 0}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  invoiceId,
                  amount,
                  method: "TRANSFER",
                  paidAt: toIsoDate(new Date()),
                  reference: "Solde enregistre depuis la facture"
                })
              });
              const payload = (await response.json()) as { ok: boolean; message?: string };

              setMessage(payload.ok ? "Facture soldee." : payload.message || "Paiement impossible.");

              if (payload.ok) {
                router.refresh();
              }
            } catch {
              setMessage("Paiement impossible pour le moment.");
            }
          });
        }}
      >
        {isPending ? "Mise a jour..." : "Marquer payee"}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}
