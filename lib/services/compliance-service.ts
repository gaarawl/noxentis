import {
  demoCompany,
  demoComplianceCheck,
  demoCustomers,
  demoPdpConnections
} from "@/lib/data/demo-data";
import type { ComplianceOverview } from "@/lib/domain/models";

export function getComplianceOverview(): ComplianceOverview {
  const customerWithoutSiren = demoCustomers.filter(
    (customer) => customer.type === "COMPANY" && !customer.siren
  );

  return {
    readiness: demoComplianceCheck.status,
    score: demoComplianceCheck.score,
    missingFields: [
      ...demoComplianceCheck.missingFields,
      ...(customerWithoutSiren.length > 0
        ? ["Un ou plusieurs clients entreprises sont sans SIREN."]
        : [])
    ],
    warnings: demoComplianceCheck.warnings,
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

export function getCompanyCompleteness() {
  return {
    company: demoCompany,
    pdpConnected: demoPdpConnections.some((item) => item.status === "CONNECTED"),
    requiredMentions: [
      { label: "SIREN client", ok: true },
      { label: "Adresse de livraison si différente", ok: true },
      { label: "Nature de l'opération", ok: true },
      { label: "TVA d'après les débits", ok: demoCompany.tvaOnDebits }
    ]
  };
}
