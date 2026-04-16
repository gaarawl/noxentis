import type {
  Company,
  ComplianceCheck,
  ComplianceOverview,
  Customer,
  Invoice,
  PdpConnection
} from "@/lib/domain/models";

type ComplianceDataset = {
  company: Company;
  customers: Customer[];
  invoices: Invoice[];
  pdpConnections: PdpConnection[];
  baseCheck?: ComplianceCheck | null;
};

type MentionCheck = { label: string; ok: boolean };

function hasMeaningfulText(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized.length > 0 && normalized !== "a completer" && normalized !== "a compléter";
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getReadiness(score: number): ComplianceCheck["status"] {
  if (score >= 85) {
    return "READY";
  }

  if (score >= 60) {
    return "PARTIALLY_READY";
  }

  return "NOT_READY";
}

export function buildRequiredMentions(dataset: ComplianceDataset): MentionCheck[] {
  const enterpriseCustomers = dataset.customers.filter((customer) => customer.type === "COMPANY");
  const customersMissingSiren = enterpriseCustomers.filter((customer) => !customer.siren);
  const invoicesMissingOperationType = dataset.invoices.filter((invoice) => !invoice.operationType);
  const hasInvoices = dataset.invoices.length > 0;
  const deliverySensitiveInvoices = dataset.invoices.filter(
    (invoice) => invoice.operationType === "PRODUCT" || invoice.operationType === "MIXED"
  );
  const invoicesMissingDeliveryAddress = deliverySensitiveInvoices.filter(
    (invoice) => !hasMeaningfulText(invoice.deliveryAddressNote)
  );

  return [
    {
      label: "SIREN client collecte",
      ok: enterpriseCustomers.length > 0 && customersMissingSiren.length === 0
    },
    {
      label: "Adresse de livraison geree",
      ok:
        hasInvoices &&
        (deliverySensitiveInvoices.length === 0 || invoicesMissingDeliveryAddress.length === 0)
    },
    {
      label: "Nature de l'operation renseignee",
      ok: hasInvoices && invoicesMissingOperationType.length === 0
    },
    {
      label: "Mention TVA sur les debits parametree",
      ok: dataset.company.tvaOnDebits
    }
  ];
}

export function buildComplianceCheck(dataset: ComplianceDataset): ComplianceCheck {
  const enterpriseCustomers = dataset.customers.filter((customer) => customer.type === "COMPANY");
  const customersMissingSiren = enterpriseCustomers.filter((customer) => !customer.siren);
  const invoicesMissingOperationType = dataset.invoices.filter((invoice) => !invoice.operationType);
  const hasInvoices = dataset.invoices.length > 0;
  const deliverySensitiveInvoices = dataset.invoices.filter(
    (invoice) => invoice.operationType === "PRODUCT" || invoice.operationType === "MIXED"
  );
  const invoicesMissingDeliveryAddress = deliverySensitiveInvoices.filter(
    (invoice) => !hasMeaningfulText(invoice.deliveryAddressNote)
  );
  const pdpConnected = dataset.pdpConnections.some((connection) => connection.status === "CONNECTED");

  const checks = [
    {
      ok:
        hasMeaningfulText(dataset.company.legalName) &&
        hasMeaningfulText(dataset.company.brandName) &&
        hasMeaningfulText(dataset.company.address) &&
        hasMeaningfulText(dataset.company.city) &&
        hasMeaningfulText(dataset.company.postalCode) &&
        hasMeaningfulText(dataset.company.country),
      weight: 20,
      missing: "Completer l'identite et l'adresse de l'entreprise."
    },
    {
      ok:
        hasMeaningfulText(dataset.company.email) &&
        hasMeaningfulText(dataset.company.phone) &&
        hasMeaningfulText(dataset.company.activityLabel) &&
        hasMeaningfulText(dataset.company.paymentTerms),
      weight: 16,
      missing: "Renseigner email finance, telephone, activite et conditions de paiement."
    },
    {
      ok: hasMeaningfulText(dataset.company.vatNumber),
      weight: 8,
      missing: "Renseigner le numero de TVA intracommunautaire lorsque necessaire."
    },
    {
      ok: dataset.customers.length > 0,
      weight: 12,
      missing: "Ajouter au moins un client pour valider les controles de conformite."
    },
    {
      ok: enterpriseCustomers.length > 0 && customersMissingSiren.length === 0,
      weight: 14,
      missing: "Completer le SIREN des clients entreprises."
    },
    {
      ok: hasInvoices && invoicesMissingOperationType.length === 0,
      weight: 10,
      missing: "Renseigner la nature de l'operation sur chaque facture."
    },
    {
      ok:
        hasInvoices &&
        (deliverySensitiveInvoices.length === 0 || invoicesMissingDeliveryAddress.length === 0),
      weight: 8,
      missing: "Documenter l'adresse de livraison lorsqu'elle differe du siege client."
    },
    {
      ok: pdpConnected,
      weight: 12,
      missing: "Connecter une PDP partenaire pour emission, reception et suivi des statuts."
    }
  ];

  const score = Math.round(
    (checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0) /
      checks.reduce((sum, check) => sum + check.weight, 0)) *
      100
  );

  const missingFields = dedupe(
    checks.filter((check) => !check.ok).map((check) => check.missing)
  );

  const warnings = dedupe([
    !dataset.company.tvaOnDebits
      ? "Precisez si la mention TVA d'apres les debits doit apparaitre par defaut."
      : "",
    !pdpConnected ? "Aucune PDP partenaire n'est connectee pour la transmission reelle." : "",
    dataset.invoices.length === 0
      ? "Aucune facture n'a encore ete emise pour tester la chaine complete."
      : "",
    customersMissingSiren.length > 0
      ? `${customersMissingSiren.length} client(s) entreprise sont encore sans SIREN.`
      : ""
  ]);

  return {
    id: dataset.baseCheck?.id || `computed-${dataset.company.id}`,
    companyId: dataset.company.id,
    score,
    status: getReadiness(score),
    missingFields,
    warnings,
    checkedAt: new Date().toISOString()
  };
}

export function buildComplianceOverview(dataset: ComplianceDataset): ComplianceOverview {
  const complianceCheck = buildComplianceCheck(dataset);
  const requiredMentions = buildRequiredMentions(dataset);
  const mentionsReady = requiredMentions.filter((item) => item.ok).length;

  return {
    readiness: complianceCheck.status,
    score: complianceCheck.score,
    missingFields: complianceCheck.missingFields,
    warnings: complianceCheck.warnings,
    nextSteps: dedupe([
      !dataset.pdpConnections.some((item) => item.status === "CONNECTED")
        ? "Connecter une PDP partenaire active."
        : "",
      !requiredMentions.find((item) => item.label === "SIREN client collecte")?.ok
        ? "Imposer le SIREN sur tous les clients entreprises."
        : "",
      !requiredMentions.find((item) => item.label === "Adresse de livraison geree")?.ok
        ? "Verifier l'adresse de livraison sur les operations produit ou mixtes."
        : "",
      !dataset.company.tvaOnDebits
        ? "Decider si la mention TVA d'apres les debits doit etre activee."
        : "",
      mentionsReady === requiredMentions.length
        ? "Lancer un test complet de transmission via votre connecteur PDP."
        : ""
    ]),
    timeline: [
      { label: "Reception electronique", date: "1 septembre 2026", state: "active" },
      {
        label: "Emission grandes entreprises / ETI",
        date: "1 septembre 2026",
        state: "upcoming"
      },
      { label: "Emission PME / micro", date: "1 septembre 2027", state: "upcoming" }
    ]
  };
}

export function buildCompanyCompleteness(dataset: ComplianceDataset) {
  return {
    company: dataset.company,
    pdpConnected: dataset.pdpConnections.some((item) => item.status === "CONNECTED"),
    requiredMentions: buildRequiredMentions(dataset)
  };
}
