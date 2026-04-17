import { pdpProviders } from "@/lib/data/demo-data";
import type { PdpCandidateInvoice, PdpTransmissionRow } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";
import { getTransmissionBlockers } from "@/lib/services/pdp-rules";

export async function getPdpOverview() {
  const data = await getDataSource();
  const currentConnection =
    data.pdpConnections.find((connection) => connection.status === "CONNECTED") ||
    data.pdpConnections[0] ||
    null;
  const connected = data.pdpConnections.some((connection) => connection.status === "CONNECTED");

  const transmissions: PdpTransmissionRow[] = data.pdpTransmissions
    .map((transmission) => {
      const invoice = data.invoices.find((item) => item.id === transmission.invoiceId);
      const customer = data.customers.find((item) => item.id === invoice?.customerId);

      return {
        ...transmission,
        invoiceNumber: invoice?.number || "-",
        customerName: customer?.legalName || "-"
      };
    })
    .sort(
      (left, right) =>
        new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
    );

  const latestTransmissionByInvoice = new Map<string, PdpTransmissionRow>();
  for (const transmission of transmissions) {
    if (!latestTransmissionByInvoice.has(transmission.invoiceId)) {
      latestTransmissionByInvoice.set(transmission.invoiceId, transmission);
    }
  }

  const candidateInvoices: PdpCandidateInvoice[] = data.invoices
    .filter((invoice) => invoice.status !== "CANCELLED")
    .map((invoice) => {
      const customer =
        data.customers.find((item) => item.id === invoice.customerId) ||
        data.customers[0];
      const blockers = customer
        ? getTransmissionBlockers({
            company: data.company,
            customer,
            invoice,
            connected
          })
        : ["Client introuvable pour cette facture."];
      const latestTransmission = latestTransmissionByInvoice.get(invoice.id);
      const readiness: PdpCandidateInvoice["readiness"] =
        blockers.length === 0 ? "ready" : "blocked";

      return {
        id: invoice.id,
        number: invoice.number,
        customerName: customer?.legalName || "Client",
        total: invoice.total,
        dueDate: invoice.dueDate,
        transmissionStatus: invoice.transmissionStatus,
        pdpStatus: invoice.pdpStatus,
        readiness,
        blockers,
        lastTransmissionStatus: latestTransmission?.internalStatus,
        lastTransmissionAt: latestTransmission?.submittedAt
      };
    })
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());

  return {
    currentConnections: data.pdpConnections,
    currentConnection,
    connected,
    providers: pdpProviders,
    statusMapping: [
      { internal: "READY", partner: "payload_prepared" },
      { internal: "QUEUED", partner: "pending_delivery" },
      { internal: "SENT_TO_PARTNER", partner: "accepted_by_partner" },
      { internal: "RECEIVED", partner: "delivered_to_customer_platform" },
      { internal: "REJECTED", partner: "delivery_rejected" }
    ],
    candidateInvoices,
    transmissions,
    stats: {
      ready: candidateInvoices.filter((invoice) => invoice.readiness === "ready").length,
      blocked: candidateInvoices.filter((invoice) => invoice.readiness === "blocked").length,
      delivered: transmissions.filter((item) => item.internalStatus === "RECEIVED").length,
      rejected: transmissions.filter((item) => item.internalStatus === "REJECTED").length
    }
  };
}
