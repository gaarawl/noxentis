import type { ComplianceAuditRow, ComplianceOverview } from "@/lib/domain/models";
import {
  buildCompanyCompleteness,
  buildComplianceOverview
} from "@/lib/services/compliance-engine";
import { getDataSource } from "@/lib/services/live-data";

export async function getComplianceOverview(): Promise<ComplianceOverview> {
  const data = await getDataSource();
  return buildComplianceOverview(data);
}

export async function getCompanyCompleteness() {
  const data = await getDataSource();
  return buildCompanyCompleteness(data);
}

export async function listComplianceAuditLogs(): Promise<ComplianceAuditRow[]> {
  const data = await getDataSource();

  return data.complianceAuditLogs
    .map((log) => {
      const invoice = log.invoiceId
        ? data.invoices.find((item) => item.id === log.invoiceId)
        : undefined;
      const customer = invoice
        ? data.customers.find((item) => item.id === invoice.customerId)
        : undefined;

      return {
        ...log,
        invoiceNumber: invoice?.number,
        customerName: customer?.legalName
      };
    })
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function getComplianceAuditSnapshot() {
  const logs = await listComplianceAuditLogs();

  return {
    logs,
    success: logs.filter((log) => log.level === "SUCCESS").length,
    warning: logs.filter((log) => log.level === "WARNING").length,
    error: logs.filter((log) => log.level === "ERROR").length
  };
}

