"use client";

import { useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const csvTemplate = `type;legalName;contactName;email;phone;siren;vatNumber;billingAddressLine1;billingCity;billingPostalCode;notes;tags
COMPANY;Atelier Horizon;Nina Petit;nina@atelier-horizon.fr;+33 6 12 34 56 78;912345678;FR12912345678;12 rue des Archives;Paris;75003;Client premium;Premium|30 jours`;

export function CustomerImportForm() {
  const router = useRouter();
  const [content, setContent] = useState(csvTemplate);
  const [message, setMessage] = useState<string | null>(null);
  const [report, setReport] = useState<{
    importedCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/62">
        Collez un CSV avec une ligne d'en-tetes. Les separateurs `;` et `,` sont acceptes.
        Les colonnes minimales recommandees sont `legalName`, `contactName`, `email`,
        `billingAddressLine1`, `billingCity`, `billingPostalCode` et `tags`.
      </div>

      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-[320px]"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setContent(csvTemplate);
            setMessage(null);
            setReport(null);
          }}
        >
          Recharger le modele
        </Button>
        <Button
          onClick={() => {
            startTransition(async () => {
              const response = await fetch("/api/customers/import", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ content })
              });

              const payload = (await response.json()) as {
                ok: boolean;
                message?: string;
                data?: {
                  importedCount: number;
                  errorCount: number;
                  errors: string[];
                };
              };

              if (!payload.ok || !payload.data) {
                setMessage(payload.message || "Impossible d'importer les clients.");
                setReport(null);
                return;
              }

              setMessage(
                `${payload.data.importedCount} client(s) importes, ${payload.data.errorCount} erreur(s).`
              );
              setReport(payload.data);
              router.refresh();
            });
          }}
          disabled={isPending}
        >
          {isPending ? "Import en cours..." : "Importer les clients"}
        </Button>
        <Link href="/clients">
          <Button variant="ghost">Retour au CRM</Button>
        </Link>
      </div>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      {report?.errors.length ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/8 p-5 text-sm text-rose-100">
          <p className="mb-3 font-medium">Lignes a verifier</p>
          <ul className="space-y-2">
            {report.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
