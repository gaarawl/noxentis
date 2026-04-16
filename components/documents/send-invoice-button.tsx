"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SendInvoiceButton({
  invoiceId
}: {
  invoiceId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch(`/api/invoices/${invoiceId}/send`, {
                method: "POST"
              });
              const payload = (await response.json()) as {
                ok: boolean;
                mode?: "preview" | "sent";
                message?: string;
              };

              setMessage(
                payload.ok
                  ? payload.mode === "preview"
                    ? "Email prepare en mode preview."
                    : "Facture envoyee par email."
                  : payload.message || "Envoi impossible."
              );

              if (payload.ok) {
                router.refresh();
              }
            } catch {
              setMessage("Envoi impossible pour le moment.");
            }
          });
        }}
      >
        {isPending ? "Envoi..." : "Envoyer"}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}
