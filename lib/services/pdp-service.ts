import { demoPdpConnections, pdpProviders } from "@/lib/data/demo-data";

export function getPdpOverview() {
  return {
    currentConnections: demoPdpConnections,
    providers: pdpProviders,
    statusMapping: [
      { internal: "READY", partner: "payload_prepared" },
      { internal: "QUEUED", partner: "pending_delivery" },
      { internal: "SENT_TO_PARTNER", partner: "accepted_by_partner" },
      { internal: "RECEIVED", partner: "delivered_to_customer_platform" },
      { internal: "REJECTED", partner: "delivery_rejected" }
    ]
  };
}
