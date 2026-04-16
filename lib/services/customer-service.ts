import { getDataSource } from "@/lib/services/live-data";
import type { Customer } from "@/lib/domain/models";

export async function listCustomers() {
  const data = await getDataSource();

  return data.customers.map((customer) => {
    const invoices = data.invoices.filter((invoice) => invoice.customerId === customer.id);
    const quotes = data.quotes.filter((quote) => quote.customerId === customer.id);

    return {
      ...customer,
      invoiceCount: invoices.length,
      quoteCount: quotes.length,
      openBalance: invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    };
  });
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const data = await getDataSource();
  return data.customers.find((customer) => customer.id === customerId) || null;
}

export async function getCustomerHistory(customerId: string) {
  const data = await getDataSource();
  const quotes = data.quotes.filter((quote) => quote.customerId === customerId);
  const invoices = data.invoices.filter((invoice) => invoice.customerId === customerId);

  return {
    quotes,
    invoices
  };
}
