import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import {
  demoActivity,
  demoCompany,
  demoComplianceCheck,
  demoCreditNotes,
  demoCustomers,
  demoInvoices,
  demoPayments,
  demoPdpConnections,
  demoQuotes,
  demoReminders,
  demoRevenueChart,
  demoSession
} from "@/lib/data/demo-data";
import type {
  ActivityItem,
  Address,
  ChartPoint,
  Company,
  ComplianceCheck,
  CreditNote,
  Customer,
  DocumentLine,
  Invoice,
  Payment,
  PdpConnection,
  Quote,
  Reminder,
  SessionUser
} from "@/lib/domain/models";

type LiveCompanyRecord = Prisma.CompanyGetPayload<{
  include: {
    owner: true;
    customers: true;
    quotes: { include: { lines: true } };
    invoices: {
      include: {
        lines: true;
        payments: true;
        reminders: true;
        creditNotes: true;
      };
    };
    pdpConnections: true;
    compliance: true;
  };
}>;

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  return Number(value || 0);
}

function readAddress(value: Prisma.JsonValue | null | undefined): Address | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  const line1 = "line1" in value && typeof value.line1 === "string" ? value.line1 : "";
  const city = "city" in value && typeof value.city === "string" ? value.city : "";
  const postalCode =
    "postalCode" in value && typeof value.postalCode === "string" ? value.postalCode : "";
  const country = "country" in value && typeof value.country === "string" ? value.country : "";

  return {
    line1,
    line2: "line2" in value && typeof value.line2 === "string" ? value.line2 : undefined,
    city,
    postalCode,
    country
  };
}

function mapLine(
  line:
    | LiveCompanyRecord["quotes"][number]["lines"][number]
    | LiveCompanyRecord["invoices"][number]["lines"][number]
): DocumentLine {
  return {
    id: line.id,
    label: line.label,
    description: line.description || undefined,
    quantity: toNumber(line.quantity),
    unitPrice: toNumber(line.unitPrice),
    taxRate: toNumber(line.taxRate),
    discount: line.discount ? toNumber(line.discount) : 0,
    total: toNumber(line.total)
  };
}

function mapCustomer(customer: LiveCompanyRecord["customers"][number]): Customer {
  return {
    id: customer.id,
    companyId: customer.companyId,
    type: customer.type,
    status: customer.status,
    legalName: customer.legalName,
    contactName: customer.contactName,
    email: customer.email,
    phone: customer.phone || "",
    siren: customer.siren || undefined,
    vatNumber: customer.vatNumber || undefined,
    billingAddress:
      readAddress(customer.billingAddress) ||
      ({ line1: "", city: "", postalCode: "", country: "France" } satisfies Address),
    deliveryAddress: readAddress(customer.deliveryAddress),
    notes: customer.notes || "",
    tags: customer.tags,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString()
  };
}

function mapQuote(quote: LiveCompanyRecord["quotes"][number]): Quote {
  return {
    id: quote.id,
    companyId: quote.companyId,
    customerId: quote.customerId,
    number: quote.number,
    status: quote.status,
    issueDate: quote.issueDate.toISOString(),
    expiryDate: quote.expiryDate.toISOString(),
    subtotal: toNumber(quote.subtotal),
    taxAmount: toNumber(quote.taxAmount),
    total: toNumber(quote.total),
    notes: quote.notes || "",
    terms: quote.terms || "",
    lines: quote.lines.map(mapLine),
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString()
  };
}

function mapInvoice(invoice: LiveCompanyRecord["invoices"][number]): Invoice {
  return {
    id: invoice.id,
    companyId: invoice.companyId,
    customerId: invoice.customerId,
    quoteId: invoice.quoteId || undefined,
    number: invoice.number,
    type: invoice.type,
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    subtotal: toNumber(invoice.subtotal),
    taxAmount: toNumber(invoice.taxAmount),
    total: toNumber(invoice.total),
    paidAmount: toNumber(invoice.paidAmount),
    remainingAmount: toNumber(invoice.remainingAmount),
    complianceStatus: invoice.complianceStatus,
    transmissionStatus: invoice.transmissionStatus,
    pdpStatus: invoice.pdpStatus,
    operationType: invoice.operationType,
    deliveryAddressNote: invoice.deliveryAddressNote || undefined,
    notes: invoice.notes || "",
    lines: invoice.lines.map(mapLine),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString()
  };
}

function mapCreditNote(creditNote: LiveCompanyRecord["invoices"][number]["creditNotes"][number]): CreditNote {
  return {
    id: creditNote.id,
    invoiceId: creditNote.invoiceId,
    companyId: creditNote.companyId,
    number: creditNote.number,
    amount: toNumber(creditNote.amount),
    reason: creditNote.reason,
    createdAt: creditNote.createdAt.toISOString()
  };
}

function mapPayment(payment: LiveCompanyRecord["invoices"][number]["payments"][number]): Payment {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: toNumber(payment.amount),
    method: payment.method,
    paidAt: payment.paidAt.toISOString(),
    reference: payment.reference || ""
  };
}

function mapReminder(reminder: LiveCompanyRecord["invoices"][number]["reminders"][number]): Reminder {
  return {
    id: reminder.id,
    invoiceId: reminder.invoiceId,
    type: reminder.type,
    scheduledAt: reminder.scheduledAt.toISOString(),
    sentAt: reminder.sentAt?.toISOString(),
    status: reminder.status,
    subject: reminder.subject
  };
}

function mapPdpConnection(connection: LiveCompanyRecord["pdpConnections"][number]): PdpConnection {
  return {
    id: connection.id,
    companyId: connection.companyId,
    providerName: connection.providerName,
    status: connection.status,
    credentialsEncrypted: connection.credentialsEncrypted,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString()
  };
}

function mapCompliance(
  companyId: string,
  check?: LiveCompanyRecord["compliance"][number]
): ComplianceCheck {
  if (!check) {
    return {
      ...demoComplianceCheck,
      companyId
    };
  }

  return {
    id: check.id,
    companyId: check.companyId,
    score: check.score,
    status: check.status,
    missingFields: Array.isArray(check.missingFields) ? check.missingFields.map(String) : [],
    warnings: Array.isArray(check.warnings) ? check.warnings.map(String) : [],
    checkedAt: check.checkedAt.toISOString()
  };
}

function buildSession(company: LiveCompanyRecord): SessionUser {
  return {
    email: company.owner.email,
    firstName: company.owner.firstName,
    lastName: company.owner.lastName,
    companyName: company.brandName,
    role: company.owner.role,
    plan: "PRO"
  };
}

function buildCompany(company: LiveCompanyRecord): Company {
  return {
    id: company.id,
    ownerId: company.ownerId,
    legalName: company.legalName,
    brandName: company.brandName,
    siren: company.siren,
    vatNumber: company.vatNumber || "",
    address: company.address,
    city: company.city,
    postalCode: company.postalCode,
    country: company.country,
    paymentTerms: company.paymentTerms,
    logoUrl: company.logoUrl || undefined,
    email: company.email || "",
    phone: company.phone || "",
    activityLabel: company.activityLabel || "",
    tvaOnDebits: company.tvaOnDebits,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString()
  };
}

function buildActivity(
  quotes: Quote[],
  invoices: Invoice[],
  payments: Payment[],
  reminders: Reminder[],
  complianceCheck: ComplianceCheck
) {
  const items: ActivityItem[] = [
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      title: `Paiement enregistré ${payment.reference || ""}`.trim(),
      description: `Paiement reçu sur la facture ${payment.invoiceId}.`,
      timestamp: payment.paidAt,
      category: "payment" as const
    })),
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      title: `Facture ${invoice.number} ${invoice.status.toLowerCase()}`,
      description: `Montant TTC ${invoice.total.toFixed(2)} € • reste ${invoice.remainingAmount.toFixed(2)} €`,
      timestamp: invoice.updatedAt,
      category: "invoice" as const
    })),
    ...quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      title: `Devis ${quote.number} ${quote.status.toLowerCase()}`,
      description: `Proposition pour ${quote.total.toFixed(2)} € TTC`,
      timestamp: quote.updatedAt,
      category: "quote" as const
    })),
    ...reminders.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: `Relance ${reminder.type.toLowerCase()}`,
      description: reminder.subject,
      timestamp: reminder.scheduledAt,
      category: "reminder" as const
    })),
    {
      id: `compliance-${complianceCheck.id}`,
      title: "Checklist conformité recalculée",
      description: `Score actuel ${complianceCheck.score}/100`,
      timestamp: complianceCheck.checkedAt,
      category: "compliance"
    }
  ];

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

function buildRevenueChart(invoices: Invoice[], payments: Payment[]): ChartPoint[] {
  if (invoices.length === 0) {
    return demoRevenueChart;
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const months = new Map<string, ChartPoint>();

  for (const invoice of invoices) {
    const key = formatter.format(new Date(invoice.issueDate));
    const current = months.get(key) || { month: key, revenue: 0, cashIn: 0, overdue: 0 };
    current.revenue += invoice.total;
    current.overdue += invoice.status === "OVERDUE" ? invoice.remainingAmount : 0;
    months.set(key, current);
  }

  for (const payment of payments) {
    const key = formatter.format(new Date(payment.paidAt));
    const current = months.get(key) || { month: key, revenue: 0, cashIn: 0, overdue: 0 };
    current.cashIn += payment.amount;
    months.set(key, current);
  }

  return Array.from(months.values()).slice(-6);
}

export const getLiveDataset = cache(async () => {
  if (!isLiveMode()) {
    return null;
  }

  const prisma = getPrisma();
  const company = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      owner: true,
      customers: { orderBy: { createdAt: "asc" } },
      quotes: {
        orderBy: { createdAt: "desc" },
        include: { lines: true }
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        include: {
          lines: true,
          payments: true,
          reminders: true,
          creditNotes: true
        }
      },
      pdpConnections: { orderBy: { createdAt: "desc" } },
      compliance: {
        orderBy: { checkedAt: "desc" }
      }
    }
  });

  if (!company) {
    return null;
  }

  const session = buildSession(company);
  const mappedCompany = buildCompany(company);
  const customers = company.customers.map(mapCustomer);
  const quotes = company.quotes.map(mapQuote);
  const invoices = company.invoices.map(mapInvoice);
  const creditNotes = company.invoices.flatMap((invoice) => invoice.creditNotes.map(mapCreditNote));
  const payments = company.invoices.flatMap((invoice) => invoice.payments.map(mapPayment));
  const reminders = company.invoices.flatMap((invoice) => invoice.reminders.map(mapReminder));
  const pdpConnections = company.pdpConnections.map(mapPdpConnection);
  const complianceCheck = mapCompliance(company.id, company.compliance[0]);
  const activity = buildActivity(quotes, invoices, payments, reminders, complianceCheck);
  const revenueChart = buildRevenueChart(invoices, payments);

  return {
    session,
    company: mappedCompany,
    customers,
    quotes,
    invoices,
    creditNotes,
    payments,
    reminders,
    pdpConnections,
    complianceCheck,
    activity,
    revenueChart
  };
});

export async function getDataSource() {
  const liveDataset = await getLiveDataset();

  if (liveDataset) {
    return liveDataset;
  }

  return {
    session: demoSession,
    company: demoCompany,
    customers: demoCustomers,
    quotes: demoQuotes,
    invoices: demoInvoices,
    creditNotes: demoCreditNotes,
    payments: demoPayments,
    reminders: demoReminders,
    pdpConnections: demoPdpConnections,
    complianceCheck: demoComplianceCheck,
    activity: demoActivity,
    revenueChart: demoRevenueChart
  };
}

export async function getCompanyContext() {
  if (!isLiveMode()) {
    return null;
  }

  const prisma = getPrisma();
  return prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      owner: true
    }
  });
}
