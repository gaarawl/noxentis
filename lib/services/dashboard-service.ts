import { formatCurrency, formatPercent } from "@/lib/domain/calculations";
import type { DashboardSnapshot } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const data = await getDataSource();
  const revenueMonth = data.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const cashIn = data.invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const pending = data.invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const conversionRate = Math.round((1 / Math.max(data.quotes.length, 1)) * 100);

  return {
    kpis: [
      {
        label: "CA du mois",
        value: formatCurrency(revenueMonth),
        hint: "Devis convertis + factures émises",
        delta: "+14 % vs mars"
      },
      {
        label: "Encaissé",
        value: formatCurrency(cashIn),
        hint: "Paiements reçus",
        delta: "+9 %",
        tone: "success"
      },
      {
        label: "En attente",
        value: formatCurrency(pending),
        hint: "Montants restant à encaisser",
        delta: `${data.reminders.length} relances programmées`,
        tone: "warning"
      },
      {
        label: "Préparation conformité",
        value: `${data.complianceCheck.score}/100`,
        hint: "Compte et données prêtes pour transmission",
        delta: formatPercent(data.complianceCheck.score)
      }
    ],
    chart: data.revenueChart,
    recentActivity: data.activity,
    cashExpected: pending,
    remindersToSend: data.reminders.filter((reminder) => reminder.status === "SCHEDULED").length,
    conversionRate
  };
}
