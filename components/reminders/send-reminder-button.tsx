"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ReminderType } from "@/lib/domain/models";

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function SendReminderButton({
  invoiceId,
  type,
  disabled
}: {
  invoiceId: string;
  type: ReminderType;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  invoiceId,
                  type,
                  mode: "SEND",
                  scheduledAt: toIsoDate(new Date()),
                  subject: ""
                })
              });

              const payload = (await response.json()) as {
                ok: boolean;
                message?: string;
                data?: { mode?: "preview" | "sent" | null };
              };
              setMessage(
                payload.ok
                  ? payload.data?.mode === "preview"
                    ? "Relance envoyee en mode preview."
                    : "Relance envoyee."
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
        {isPending ? "Envoi..." : "Relancer"}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}
