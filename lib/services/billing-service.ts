import { pricingPlans } from "@/lib/data/demo-data";

export function getBillingOverview() {
  return {
    activePlan: "PRO",
    trialEndsAt: "2026-04-30",
    nextInvoiceAmount: "79 €",
    includedUsers: 5,
    pricingPlans
  };
}
