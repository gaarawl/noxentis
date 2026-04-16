import type { BillingEvent } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function listBillingEvents(): Promise<BillingEvent[]> {
  const data = await getDataSource();

  return [...data.billingEvents].sort(
    (left, right) => new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime()
  );
}

