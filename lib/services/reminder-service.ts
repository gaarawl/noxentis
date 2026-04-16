import type {
  RemindableInvoiceRow,
  ReminderStatus,
  ReminderTimelineRow,
  ReminderType
} from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

function getReminderTimestamp(reminder: {
  sentAt?: string;
  scheduledAt: string;
}) {
  return reminder.sentAt || reminder.scheduledAt;
}

function getRecommendedReminderType(dueDate: string): ReminderType {
  const due = new Date(dueDate);
  const now = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (dueDay < nowDay) {
    return "OVERDUE";
  }

  if (dueDay === nowDay) {
    return "DUE_DATE";
  }

  return "PRE_DUE";
}

export async function listReminders(): Promise<ReminderTimelineRow[]> {
  const data = await getDataSource();

  return data.reminders
    .map((reminder) => {
      const invoice = data.invoices.find((item) => item.id === reminder.invoiceId);
      const customer = data.customers.find((item) => item.id === invoice?.customerId);

      return {
        ...reminder,
        invoiceNumber: invoice?.number || "-",
        customerName: customer?.legalName || "-",
        amountDue: invoice?.remainingAmount || 0,
        dueDate: invoice?.dueDate || reminder.scheduledAt
      };
    })
    .sort(
      (left, right) =>
        new Date(getReminderTimestamp(right)).getTime() -
        new Date(getReminderTimestamp(left)).getTime()
    );
}

export async function listRemindableInvoices(): Promise<RemindableInvoiceRow[]> {
  const data = await getDataSource();

  return data.invoices
    .filter(
      (invoice) =>
        invoice.remainingAmount > 0 &&
        invoice.status !== "PAID" &&
        invoice.status !== "CANCELLED"
    )
    .map((invoice) => {
      const customer =
        data.customers.find((item) => item.id === invoice.customerId)?.legalName || "Client";
      const reminderHistory = data.reminders
        .filter((reminder) => reminder.invoiceId === invoice.id)
        .sort(
          (left, right) =>
            new Date(getReminderTimestamp(right)).getTime() -
            new Date(getReminderTimestamp(left)).getTime()
        );
      const latestReminder = reminderHistory[0];

      return {
        id: invoice.id,
        number: invoice.number,
        customerName: customer,
        dueDate: invoice.dueDate,
        total: invoice.total,
        remainingAmount: invoice.remainingAmount,
        status: invoice.status,
        recommendedReminderType: getRecommendedReminderType(invoice.dueDate),
        lastReminderType: latestReminder?.type,
        lastReminderStatus: latestReminder?.status as ReminderStatus | undefined,
        lastReminderAt: latestReminder
          ? getReminderTimestamp(latestReminder)
          : undefined
      };
    })
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());
}

export async function getReminderSnapshot() {
  const reminders = await listReminders();
  const invoices = await listRemindableInvoices();
  const scheduled = reminders.filter((reminder) => reminder.status === "SCHEDULED").length;
  const sent = reminders.filter((reminder) => reminder.status === "SENT").length;
  const dueNow = reminders.filter(
    (reminder) =>
      reminder.status === "SCHEDULED" && new Date(reminder.scheduledAt).getTime() <= Date.now()
  ).length;

  return {
    reminders,
    invoices,
    scheduled,
    sent,
    dueNow
  };
}
