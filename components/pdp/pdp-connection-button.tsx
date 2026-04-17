"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PdpConnectionButton({
  providerSlug,
  action,
  label,
  variant = "secondary",
  disabled = false
}: {
  providerSlug: string;
  action: "connect" | "disconnect";
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant={variant}
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await fetch("/api/pdp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  action,
                  providerSlug
                })
              });

              const payload = (await response.json()) as {
                ok: boolean;
                message?: string;
              };

              setMessage(
                payload.ok
                  ? payload.message || "Operation PDP terminee."
                  : payload.message || "Operation PDP impossible."
              );

              if (payload.ok) {
                router.refresh();
              }
            } catch {
              setMessage("Operation PDP impossible pour le moment.");
            }
          });
        }}
      >
        {isPending ? "Mise a jour..." : label}
      </Button>
      {message ? <p className="text-right text-xs text-white/45">{message}</p> : null}
    </div>
  );
}

