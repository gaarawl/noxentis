import { formatCurrency } from "@/lib/domain/calculations";
import type { DashboardSnapshot } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const data = await getDataSource();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const isCurrentMonth = (value: string) => {
    const date = new Date(value);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const currentMonthInvoices = data.invoices.filter((invoice) => isCurrentMonth(invoice.issueDate));
  const currentMonthPayments = data.payments.filter((payment) => isCurrentMonth(payment.paidAt));
  const revenueMonth = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const cashIn = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pending = data.invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const scheduledReminders = data.reminders.filter((reminder) => reminder.status === "SCHEDULED").length;
  const remindersToSend = data.reminders.filter(
    (reminder) =>
      reminder.status === "SCHEDULED" && new Date(reminder.scheduledAt).getTime() <= Date.now()
  ).length;
  const convertedQuoteIds = new Set(
    data.invoices
      .map((invoice) => invoice.quoteId)
      .filter((quoteId): quoteId is string => Boolean(quoteId))
  );
  const conversionRate =
    data.quotes.length === 0 ? 0 : Math.round((convertedQuoteIds.size / data.quotes.length) * 100);
  const readinessLabel =
    data.complianceCheck.status === "READY"
      ? "Pret"
      : data.complianceCheck.status === "PARTIALLY_READY"
        ? "Partiel"
        : "A lancer";

  return {
    kpis: [
      {
        label: "CA du mois",
        value: formatCurrency(revenueMonth),
        hint: "Factures emises sur le mois en cours",
        delta: `${currentMonthInvoices.length} facture(s)`
      },
      {
        label: "Encaisse",
        value: formatCurrency(cashIn),
        hint: "Paiements recus sur le mois en cours",
        delta: `${currentMonthPayments.length} paiement(s)`,
        tone: "success"
      },
      {
        label: "En attente",
        value: formatCurrency(pending),
        hint: "Montants restant a encaisser",
        delta: `${scheduledReminders} relance(s) programmee(s)`,
        tone: "warning"
      },
      {
        label: "Preparation conformite",
        value: `${data.complianceCheck.score}/100`,
        hint: "Compte et donnees pretes pour transmission",
        delta: readinessLabel
      }
    ],
    chart: data.revenueChart,
    recentActivity: data.activity,
    cashExpected: pending,
    remindersToSend,
    conversionRate
  };
}
