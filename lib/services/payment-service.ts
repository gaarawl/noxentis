import { demoCustomers, demoInvoices, demoPayments, demoReminders } from "@/lib/data/demo-data";
import type { PaymentTimelineRow, ReminderTimelineRow } from "@/lib/domain/models";

export function listPayments(): PaymentTimelineRow[] {
  return demoPayments.map((payment) => {
    const invoice = demoInvoices.find((item) => item.id === payment.invoiceId);
    const customer = demoCustomers.find((item) => item.id === invoice?.customerId);

    return {
      ...payment,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-"
    };
  });
}

export function listReminders(): ReminderTimelineRow[] {
  return demoReminders.map((reminder) => {
    const invoice = demoInvoices.find((item) => item.id === reminder.invoiceId);
    const customer = demoCustomers.find((item) => item.id === invoice?.customerId);

    return {
      ...reminder,
      invoiceNumber: invoice?.number || "-",
      customerName: customer?.legalName || "-",
      amountDue: invoice?.remainingAmount || 0
    };
  });
}
