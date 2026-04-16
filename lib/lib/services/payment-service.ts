import type { PaymentTimelineRow, ReminderTimelineRow } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function listPayments(): Promise<PaymentTimelineRow[]> {
  const data = await getDataSource();

  return data.payments.map((payment) => {
    const invoice = data.invoices.find((item) => item.id === payment.invoiceId);
    const customer = data.customers.find((item) => item.id === invoice?.customerId);

    return {
      ...payment,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-"
    };
  });
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
