import type { Company, Customer, Invoice } from "@/lib/domain/models";

function hasMeaningfulText(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized.length > 0 && normalized !== "a completer";
}

export function buildTransmissionPayloadSummary(invoice: Invoice, customer: Customer) {
  return [
    `Facture ${invoice.number}`,
    `client ${customer.legalName}`,
    `operation ${invoice.operationType.toLowerCase()}`,
    `${invoice.lines.length} ligne(s)`,
    `${invoice.total.toFixed(2)} EUR`
  ].join(" - ");
}

export function getTransmissionBlockers(input: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  connected: boolean;
}) {
  const blockers: string[] = [];

  if (!input.connected) {
    blockers.push("Connecter une PDP partenaire avant toute transmission.");
  }

  if (!hasMeaningfulText(input.company.legalName) || !hasMeaningfulText(input.company.siren)) {
    blockers.push("Completer l'identite legale de l'entreprise avant emission.");
  }

  if (!hasMeaningfulText(input.company.email) || !hasMeaningfulText(input.company.paymentTerms)) {
    blockers.push("Renseigner email finance et conditions de paiement.");
  }

  if (input.customer.type === "COMPANY" && !hasMeaningfulText(input.customer.siren)) {
    blockers.push(`Le client ${input.customer.legalName} doit avoir un SIREN pour la transmission.`);
  }

  if (!hasMeaningfulText(input.invoice.operationType)) {
    blockers.push("La nature de l'operation doit etre renseignee.");
  }

  if (
    (input.invoice.operationType === "PRODUCT" || input.invoice.operationType === "MIXED") &&
    !hasMeaningfulText(input.invoice.deliveryAddressNote)
  ) {
    blockers.push("Ajouter l'adresse de livraison ou sa note lorsqu'elle differe.");
  }

  if (input.invoice.status === "DRAFT") {
    blockers.push("La facture doit etre emise avant la transmission partenaire.");
  }

  if (input.invoice.transmissionStatus === "RECEIVED") {
    blockers.push("Cette facture a deja ete transmise avec succes.");
  }

  return blockers;
}

