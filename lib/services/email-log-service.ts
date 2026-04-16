import type { EmailDeliveryKind, EmailDeliveryRow } from "@/lib/domain/models";
import { getDataSource } from "@/lib/services/live-data";

export async function listEmailDeliveries(kind?: EmailDeliveryKind): Promise<EmailDeliveryRow[]> {
  const data = await getDataSource();

  return data.emailDeliveries
    .filter((delivery) => (kind ? delivery.kind === kind : true))
    .map((delivery) => {
      const invoice = delivery.invoiceId
        ? data.invoices.find((item) => item.id === delivery.invoiceId)
        : undefined;
      const customer = invoice
        ? data.customers.find((item) => item.id === invoice.customerId)
        : undefined;

      return {
        ...delivery,
        invoiceNumber: invoice?.number,
        customerName: customer?.legalName || delivery.recipientName || undefined
      };
    })
    .sort(
      (left, right) =>
        new Date(right.sentAt || right.createdAt).getTime() -
        new Date(left.sentAt || left.createdAt).getTime()
    );
}

export async function getEmailDeliverySnapshot() {
  const deliveries = await listEmailDeliveries();

  return {
    deliveries,
    sent: deliveries.filter((delivery) => delivery.status === "SENT").length,
    preview: deliveries.filter((delivery) => delivery.status === "PREVIEW").length,
    failed: deliveries.filter((delivery) => delivery.status === "FAILED").length
  };
}

