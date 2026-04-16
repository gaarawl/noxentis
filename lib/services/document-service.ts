import { calculateDocumentTotals } from "@/lib/domain/calculations";
import type {
  DocumentLine,
  InvoiceTableRow,
  QuoteTableRow
} from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function listQuotes(): Promise<QuoteTableRow[]> {
  const data = await getDataSource();

  return data.quotes.map((quote) => ({
    ...quote,
    customerName:
      data.customers.find((customer) => customer.id === quote.customerId)?.legalName || "Client"
  }));
}

export async function listInvoices(): Promise<InvoiceTableRow[]> {
  const data = await getDataSource();

  return data.invoices.map((invoice) => ({
    ...invoice,
    customerName:
      data.customers.find((customer) => customer.id === invoice.customerId)?.legalName || "Client"
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
  const customer =
    data.customers[0] ||
    ({
      id: "",
      companyId: data.company.id,
      type: "COMPANY",
      status: "ONBOARDING",
      legalName: "Créez d'abord un client",
      contactName: "",
      email: "",
      phone: "",
      billingAddress: {
        line1: "",
        city: "",
        postalCode: "",
        country: "France"
      },
      notes: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
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
    company: data.company,
    customer,
    lines: baseLines,
    totals,
    number:
      kind === "quote"
        ? `DEV-2026-0${data.quotes.length + 50}`
        : `FAC-2026-1${data.invoices.length + 30}`
  };
}
