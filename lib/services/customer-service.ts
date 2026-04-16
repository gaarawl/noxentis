import { demoCustomers, demoInvoices, demoQuotes } from "@/lib/data/demo-data";
import type { Customer } from "@/lib/domain/models";

export function listCustomers() {
  return demoCustomers.map((customer) => {
    const invoices = demoInvoices.filter((invoice) => invoice.customerId === customer.id);
    const quotes = demoQuotes.filter((quote) => quote.customerId === customer.id);

    return {
      ...customer,
      invoiceCount: invoices.length,
      quoteCount: quotes.length,
      openBalance: invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    };
  });
}

export function getCustomerById(customerId: string): Customer | null {
  return demoCustomers.find((customer) => customer.id === customerId) || null;
}

export function getCustomerHistory(customerId: string) {
  const quotes = demoQuotes.filter((quote) => quote.customerId === customerId);
  const invoices = demoInvoices.filter((invoice) => invoice.customerId === customerId);

  return {
    quotes,
    invoices
  };
}
