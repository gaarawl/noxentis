import type { ComplianceOverview } from "@/lib/domain/models";
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
