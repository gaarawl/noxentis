import type { PaymentTimelineRow, ReceivableInvoiceRow, ReminderTimelineRow } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function listPayments(): Promise<PaymentTimelineRow[]> {
  const data = await getDataSource();

  return data.payments
    .map((payment) => {
      const invoice = data.invoices.find((item) => item.id === payment.invoiceId);
      const customer = data.customers.find((item) => item.id === invoice?.customerId);

      return {
        ...payment,
        invoiceNumber: invoice?.number || "-",
        customerName: customer?.legalName || "-"
      };
    })
    .sort((left, right) => new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime());
}

export async function listReceivableInvoices(): Promise<ReceivableInvoiceRow[]> {
  const data = await getDataSource();

  return data.invoices
    .filter((invoice) => invoice.remainingAmount > 0 && invoice.status !== "CANCELLED")
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      customerName:
        data.customers.find((customer) => customer.id === invoice.customerId)?.legalName || "Client",
      dueDate: invoice.dueDate,
      total: invoice.total,
      paidAmount: invoice.paidAmount,
      remainingAmount: invoice.remainingAmount,
      status: invoice.status
    }))
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());
}

export async function listReminders(): Promise<ReminderTimelineRow[]> {
  const data = await getDataSource();

  return data.reminders.map((reminder) => {
    const invoice = data.invoices.find((item) => item.id === reminder.invoiceId);
    const customer = data.customers.find((item) => item.id === invoice?.customerId);

    return {
      ...reminder,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-",
      amountDue: invoice?.remainingAmount || 0
    };
  });
}
