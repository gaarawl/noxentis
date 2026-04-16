import type { ComplianceOverview } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function getComplianceOverview(): Promise<ComplianceOverview> {
  const data = await getDataSource();
  const customerWithoutSiren = data.customers.filter(
    (customer) => customer.type === "COMPANY" && !customer.siren
  );

  return {
    readiness: data.complianceCheck.status,
    score: data.complianceCheck.score,
    missingFields: [
      ...data.complianceCheck.missingFields,
      ...(customerWithoutSiren.length > 0
        ? ["Un ou plusieurs clients entreprises sont sans SIREN."]
        : [])
    ],
    warnings: data.complianceCheck.warnings,
    nextSteps: [
      "Valider la connexion PDP partenaire active pour l'émission.",
      "Imposer la collecte du SIREN client sur tout nouveau compte entreprise.",
      "Activer le journal d'audit et la supervision des statuts de transmission."
    ],
    timeline: [
      { label: "Réception électronique", date: "1 septembre 2026", state: "active" },
      { label: "Émission grandes entreprises / ETI", date: "1 septembre 2026", state: "upcoming" },
      { label: "Émission PME / micro", date: "1 septembre 2027", state: "upcoming" }
    ]
  };
}

export async function getCompanyCompleteness() {
  const data = await getDataSource();
  return {
    company: data.company,
    pdpConnected: data.pdpConnections.some((item) => item.status === "CONNECTED"),
    requiredMentions: [
      { label: "SIREN client", ok: true },
      { label: "Adresse de livraison si différente", ok: true },
      { label: "Nature de l'opération", ok: true },
      { label: "TVA d'après les débits", ok: data.company.tvaOnDebits }
    ]
  };
}
