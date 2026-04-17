import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getCompanyCompleteness,
  getComplianceAuditSnapshot,
  getComplianceOverview
} from "@/lib/services/compliance-service";
import { getPdpOverview } from "@/lib/services/pdp-service";

function hasValue(value?: string | null) {
  return Boolean(value?.trim());
}

function readinessLabel(status: "READY" | "PARTIALLY_READY" | "NOT_READY") {
  if (status === "READY") {
    return "Pret";
  }

  if (status === "PARTIALLY_READY") {
    return "Partiel";
  }

  return "A lancer";
}

function readinessVariant(status: "READY" | "PARTIALLY_READY" | "NOT_READY") {
  if (status === "READY") {
    return "success" as const;
  }

  if (status === "PARTIALLY_READY") {
    return "warning" as const;
  }

  return "danger" as const;
}

export default async function CompliancePage() {
  const [overview, completeness, auditSnapshot, pdpOverview] = await Promise.all([
    getComplianceOverview(),
    getCompanyCompleteness(),
    getComplianceAuditSnapshot(),
    getPdpOverview()
  ]);

  const profileReady = [
    completeness.company.legalName,
    completeness.company.brandName,
    completeness.company.address,
    completeness.company.city,
    completeness.company.postalCode,
    completeness.company.country,
    completeness.company.email,
    completeness.company.phone,
    completeness.company.activityLabel,
    completeness.company.paymentTerms,
    completeness.company.vatNumber
  ].every(hasValue);
  const clientsReady =
    completeness.requiredMentions.find((item) => item.label === "SIREN client collecte")?.ok ||
    false;
  const transmissionReady = completeness.pdpConnected;
  const controlledCount = completeness.requiredMentions.filter((item) => item.ok).length;
  const blockerPreview = overview.missingFields.slice(0, 3);

  const actionCards = [
    {
      title: "Profil entreprise",
      description: "Raison sociale, TVA, adresse, email finance et conditions de paiement.",
      complete: profileReady,
      href: "/settings/company",
      cta: profileReady ? "Verifier" : "Completer"
    },
    {
      title: "Base clients",
      description: "Clients entreprises avec SIREN et informations prêtes pour la transmission.",
      complete: clientsReady,
      href: "/clients",
      cta: clientsReady ? "Revoir" : "Ajouter"
    },
    {
      title: "Connexion PDP",
      description: "Couche de transmission partenaire pour emission, reception et statuts.",
      complete: transmissionReady,
      href: "/integrations/pdp",
      cta: transmissionReady ? "Consulter" : "Connecter"
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Conformite"
        title="Preparation reforme, claire et pilotable"
        description="Un espace de preparation sobre pour savoir ce qu'il reste a structurer avant une vraie transmission electronique."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Etat actuel</CardTitle>
            <Badge variant={readinessVariant(overview.readiness)}>
              {readinessLabel(overview.readiness)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-white/42">Score de preparation</p>
                  <p className="mt-2 text-5xl font-semibold text-white">{overview.score}</p>
                </div>
                <p className="max-w-[220px] text-right text-sm text-white/48">
                  {controlledCount}/{completeness.requiredMentions.length} points reglementaires
                  deja couverts
                </p>
              </div>
              <div className="mt-5 h-2.5 rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(110,231,183,0.85))]"
                  style={{ width: `${Math.max(overview.score, 4)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              {actionCards.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-white/48">{item.description}</p>
                  </div>
                  <Badge variant={item.complete ? "success" : "danger"}>
                    {item.complete ? "OK" : "A traiter"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan d'action prioritaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-white/52">{item.description}</p>
                  </div>
                  <Badge variant={item.complete ? "success" : "warning"}>
                    {item.complete ? "Pret" : "En attente"}
                  </Badge>
                </div>
                <div className="mt-4">
                  <Link href={item.href}>
                    <Button variant={item.complete ? "secondary" : "primary"}>{item.cta}</Button>
                  </Link>
                </div>
              </div>
            ))}

            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="font-medium text-white">Blocages actuels</p>
              <div className="mt-3 space-y-3 text-sm text-white/58">
                {blockerPreview.length > 0 ? (
                  blockerPreview.map((item) => <p key={item}>{item}</p>)
                ) : (
                  <p>Aucun blocage critique detecte pour le moment.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Points controles automatiquement</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {completeness.requiredMentions.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <span className="text-sm text-white/70">{item.label}</span>
                <Badge variant={item.ok ? "success" : "danger"}>
                  {item.ok ? "Valide" : "A completer"}
                </Badge>
              </div>
            ))}
            {overview.warnings.length > 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">
                <p className="mb-2 font-medium text-white">Points de vigilance</p>
                {overview.warnings.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendrier legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.timeline.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-white/45">{item.date}</p>
                </div>
                <Badge
                  variant={
                    item.state === "active"
                      ? "warning"
                      : item.state === "done"
                        ? "success"
                        : "outline"
                  }
                >
                  {item.state}
                </Badge>
              </div>
            ))}

            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/58">
              Le PDF visuel reste utile pour la lecture client, mais il ne remplace pas un flux
              electronique structure transmis via une plateforme partenaire.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Journal d'audit conformite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/45">Succes</p>
                <p className="mt-3 text-3xl font-semibold text-white">{auditSnapshot.success}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/45">Alertes</p>
                <p className="mt-3 text-3xl font-semibold text-white">{auditSnapshot.warning}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-white/45">Erreurs</p>
                <p className="mt-3 text-3xl font-semibold text-white">{auditSnapshot.error}</p>
              </div>
            </div>

            {auditSnapshot.logs.length === 0 ? (
              <EmptyState
                title="Aucun evenement d'audit"
                description="Les actions de profil, de connexion PDP et de transmission seront journalisees ici."
              />
            ) : (
              <div className="space-y-3">
                {auditSnapshot.logs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{log.title}</p>
                        <p className="text-sm text-white/48">
                          {log.invoiceNumber
                            ? `${log.invoiceNumber}${log.customerName ? ` - ${log.customerName}` : ""}`
                            : log.category}
                        </p>
                      </div>
                      <Badge
                        variant={
                          log.level === "SUCCESS"
                            ? "success"
                            : log.level === "ERROR"
                              ? "danger"
                              : log.level === "WARNING"
                                ? "warning"
                                : "outline"
                        }
                      >
                        {log.level}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/58">{log.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Etat transmission partenaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Pipeline PDP</p>
                  <p className="mt-1 text-sm text-white/52">
                    {pdpOverview.connected
                      ? "Une connexion partenaire est active pour vos tests de transmission."
                      : "Aucune connexion partenaire active pour le moment."}
                  </p>
                </div>
                <Badge variant={pdpOverview.connected ? "success" : "warning"}>
                  {pdpOverview.connected ? "Actif" : "En attente"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-sm text-white/65">Factures pretes a transmettre</span>
                <span className="font-medium text-white">{pdpOverview.stats.ready}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-sm text-white/65">Transmissions delivrees</span>
                <span className="font-medium text-white">{pdpOverview.stats.delivered}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-sm text-white/65">Transmissions bloquees</span>
                <span className="font-medium text-white">{pdpOverview.stats.blocked + pdpOverview.stats.rejected}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/58">
              {pdpOverview.transmissions[0] ? (
                <>
                  Dernier statut observe :{" "}
                  <span className="font-medium text-white">
                    {pdpOverview.transmissions[0].invoiceNumber}
                  </span>{" "}
                  avec retour{" "}
                  <span className="font-medium text-white">
                    {pdpOverview.transmissions[0].partnerStatus}
                  </span>
                  .
                </>
              ) : (
                <>Aucune transmission n'a encore ete simulee depuis ce compte.</>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
