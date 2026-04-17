"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function TransmitInvoiceButton({
  invoiceId,
  disabled = false
}: {
  invoiceId: string;
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
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch("/api/pdp/transmit", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  invoiceId
                })
              });

              const payload = (await response.json()) as {
                ok: boolean;
                message?: string;
              };

              setMessage(payload.message || (payload.ok ? "Transmission terminee." : "Transmission impossible."));

              router.refresh();
            } catch {
              setMessage("Transmission impossible pour le moment.");
            }
          });
        }}
      >
        {isPending ? "Transmission..." : "Transmettre"}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}

