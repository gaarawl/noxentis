import { getDataSource } from "@/lib/services/live-data";
import type { Company, Customer, Invoice, Quote } from "@/lib/domain/models";

export type ExportDocumentKind = "quote" | "invoice";

type ExportDocumentMap = {
  quote: Quote;
  invoice: Invoice;
};

export type ExportDocumentResult<K extends ExportDocumentKind> = {
  kind: K;
  company: Company;
  customer: Customer;
  document: ExportDocumentMap[K];
};

export async function getExportDocument<K extends ExportDocumentKind>(
  kind: K,
  documentId: string
): Promise<ExportDocumentResult<K> | null> {
  const data = await getDataSource();

  if (kind === "quote") {
    const document = data.quotes.find((quote) => quote.id === documentId);
    if (!document) {
      return null;
    }

    const customer = data.customers.find((item) => item.id === document.customerId);
    if (!customer) {
      return null;
    }

    return {
      kind,
      company: data.company,
      customer,
      document
    } as ExportDocumentResult<K>;
  }

  const document = data.invoices.find((invoice) => invoice.id === documentId);
  if (!document) {
    return null;
  }

  const customer = data.customers.find((item) => item.id === document.customerId);
  if (!customer) {
    return null;
  }

  return {
    kind,
    company: data.company,
    customer,
    document
  } as ExportDocumentResult<K>;
}
