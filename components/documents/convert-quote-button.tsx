"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ConvertQuoteButton({
  quoteId,
  disabled
}: {
  quoteId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch(`/api/quotes/${quoteId}/convert`, {
                method: "POST"
              });
              const payload = (await response.json()) as {
                ok: boolean;
                message?: string;
                data?: { number?: string };
              };

              setMessage(
                payload.ok
                  ? `Facture ${payload.data?.number || ""} creee.`.trim()
                  : payload.message || "Conversion impossible."
              );

              if (payload.ok) {
                router.refresh();
              }
            } catch {
              setMessage("Conversion impossible pour le moment.");
            }
          });
        }}
      >
        {isPending ? "Conversion..." : "Convertir"}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}
