import {
  demoActivity,
  demoComplianceCheck,
  demoInvoices,
  demoQuotes,
  demoReminders,
  demoRevenueChart
} from "@/lib/data/demo-data";
import { formatCurrency, formatPercent } from "@/lib/domain/calculations";
import type { DashboardSnapshot } from "@/lib/domain/models";

export function getDashboardSnapshot(): DashboardSnapshot {
  const revenueMonth = demoInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const cashIn = demoInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const pending = demoInvoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const conversionRate = Math.round((1 / demoQuotes.length) * 100);

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
        delta: `${demoReminders.length} relances programmées`,
        tone: "warning"
      },
      {
        label: "Préparation conformité",
        value: `${demoComplianceCheck.score}/100`,
        hint: "Compte et données prêtes pour transmission",
        delta: formatPercent(demoComplianceCheck.score)
      }
    ],
    chart: demoRevenueChart,
    recentActivity: demoActivity,
    cashExpected: pending,
    remindersToSend: demoReminders.filter((reminder) => reminder.status === "SCHEDULED").length,
    conversionRate
  };
}
