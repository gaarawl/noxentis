import { addDays } from "date-fns";

import { calculateDocumentTotals } from "@/lib/domain/calculations";
import type { DocumentLine, InvoiceTableRow, QuoteTableRow } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

function formatIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function listQuotes(): Promise<QuoteTableRow[]> {
  const data = await getDataSource();

  return data.quotes.map((quote) => ({
    ...quote,
    customerName:
      data.customers.find((customer) => customer.id === quote.customerId)?.legalName || "Client",
    convertedInvoiceNumber: data.invoices.find((invoice) => invoice.quoteId === quote.id)?.number,
    canConvert: !data.invoices.some((invoice) => invoice.quoteId === quote.id)
  }));
}

export async function listInvoices(): Promise<InvoiceTableRow[]> {
  const data = await getDataSource();

  return data.invoices.map((invoice) => ({
    ...invoice,
    customerName:
      data.customers.find((customer) => customer.id === invoice.customerId)?.legalName || "Client",
    sourceQuoteNumber: data.quotes.find((quote) => quote.id === invoice.quoteId)?.number,
    lastEmailStatus: data.emailDeliveries
      .filter((delivery) => delivery.kind === "INVOICE" && delivery.invoiceId === invoice.id)
      .sort(
        (left, right) =>
          new Date(right.sentAt || right.createdAt).getTime() -
          new Date(left.sentAt || left.createdAt).getTime()
      )[0]?.status,
    lastEmailSentAt: data.emailDeliveries
      .filter((delivery) => delivery.kind === "INVOICE" && delivery.invoiceId === invoice.id)
      .sort(
        (left, right) =>
          new Date(right.sentAt || right.createdAt).getTime() -
          new Date(left.sentAt || left.createdAt).getTime()
      )[0]?.sentAt
  }));
}

export async function listCreditNotes() {
  const data = await getDataSource();

  return data.creditNotes.map((creditNote) => {
    const invoice = data.invoices.find((item) => item.id === creditNote.invoiceId);
    const customer = data.customers.find((item) => item.id === invoice?.customerId);

    return {
      ...creditNote,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-"
    };
  });
}

export async function getDocumentComposerDefaults(kind: "quote" | "invoice") {
  const data = await getDataSource();
  const today = new Date();
  const customer = data.customers[0] || null;
  const baseLines: DocumentLine[] = [
    {
      id: `line-${kind}-1`,
      label: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 20,
      discount: 0,
      total: 0
    }
  ];

  const totals = calculateDocumentTotals(baseLines);
  const currentYear = today.getFullYear();
  const nextSequence =
    kind === "quote" ? String(data.quotes.length + 1).padStart(3, "0") : String(data.invoices.length + 1).padStart(3, "0");

  return {
    company: data.company,
    customer,
    lines: baseLines,
    totals,
    number:
      kind === "quote"
        ? `DEV-${currentYear}-${nextSequence}`
        : `FAC-${currentYear}-${nextSequence}`,
    issueDate: formatIsoDate(today),
    expiryDate: formatIsoDate(addDays(today, 15)),
    dueDate: formatIsoDate(addDays(today, 30)),
    notes: "",
    terms: ""
  };
}
