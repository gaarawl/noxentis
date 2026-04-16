import { pdpProviders } from "@/lib/data/demo-data";
import { getDataSource } from "@/lib/services/live-data";

export async function getPdpOverview() {
  const data = await getDataSource();
  const currentConnection = data.pdpConnections.find((connection) => connection.status === "CONNECTED")
    || data.pdpConnections[0]
    || null;

  return {
    currentConnections: data.pdpConnections,
    currentConnection,
    connected: data.pdpConnections.some((connection) => connection.status === "CONNECTED"),
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
