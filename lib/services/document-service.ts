import {
  demoCompany,
  demoCreditNotes,
  demoCustomers,
  demoInvoices,
  demoQuotes
} from "@/lib/data/demo-data";
import { calculateDocumentTotals } from "@/lib/domain/calculations";
import type {
  DocumentLine,
  InvoiceTableRow,
  QuoteTableRow
} from "@/lib/domain/models";

export function listQuotes(): QuoteTableRow[] {
  return demoQuotes.map((quote) => ({
    ...quote,
    customerName:
      demoCustomers.find((customer) => customer.id === quote.customerId)?.legalName || "Client"
  }));
}

export function listInvoices(): InvoiceTableRow[] {
  return demoInvoices.map((invoice) => ({
    ...invoice,
    customerName:
      demoCustomers.find((customer) => customer.id === invoice.customerId)?.legalName || "Client"
  }));
}

export function listCreditNotes() {
  return demoCreditNotes.map((creditNote) => {
    const invoice = demoInvoices.find((item) => item.id === creditNote.invoiceId);
    const customer = demoCustomers.find((item) => item.id === invoice?.customerId);

    return {
      ...creditNote,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-"
    };
  });
}

export function getDocumentComposerDefaults(kind: "quote" | "invoice") {
  const customer = demoCustomers[0];
  const baseLines: DocumentLine[] =
    kind === "quote"
      ? [
          {
            id: "line-temp-1",
            label: "Pack conseil conformité",
            description: "Atelier, cadrage mentions et workflow équipe",
            quantity: 1,
            unitPrice: 1800,
            taxRate: 20,
            discount: 0,
            total: 1800
          }
        ]
      : [
          {
            id: "line-temp-2",
            label: "Mission conseil premium",
            description: "Accompagnement sprint 01",
            quantity: 1,
            unitPrice: 2200,
            taxRate: 20,
            discount: 0,
            total: 2200
          }
        ];

  const totals = calculateDocumentTotals(baseLines);

  return {
    company: demoCompany,
    customer,
    lines: baseLines,
    totals,
    number:
      kind === "quote"
        ? `DEV-2026-0${demoQuotes.length + 50}`
        : `FAC-2026-1${demoInvoices.length + 30}`
  };
}
