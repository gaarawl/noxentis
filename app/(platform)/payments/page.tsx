import { PaymentRecorder } from "@/components/payments/payment-recorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/domain/calculations";
import { listPayments, listReceivableInvoices } from "@/lib/services/payment-service";

function paymentMethodLabel(method: "TRANSFER" | "CARD" | "SEPA" | "CASH") {
  switch (method) {
    case "TRANSFER":
      return "Virement";
    case "CARD":
      return "Carte";
    case "SEPA":
      return "SEPA";
    case "CASH":
      return "Especes";
    default:
      return method;
  }
}

export default async function PaymentsPage() {
  const [payments, receivableInvoices] = await Promise.all([
    listPayments(),
    listReceivableInvoices()
  ]);

  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pending = receivableInvoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Paiements"
        title="Encaissements suivis proprement"
        description="Enregistrez vos reglements, gerez les paiements partiels et mettez a jour le solde des factures en temps reel."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Encaissements cumules</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Solde a encaisser</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Factures ouvertes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{receivableInvoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Paiements journalises</p>
            <p className="mt-3 text-3xl font-semibold text-white">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enregistrer un reglement</CardTitle>
        </CardHeader>
        <CardContent>
          {receivableInvoices.length === 0 ? (
            <EmptyState
              title="Aucune facture en attente"
              description="Des qu'une facture aura un solde restant, vous pourrez enregistrer ici un paiement partiel ou complet."
            />
          ) : (
            <PaymentRecorder invoices={receivableInvoices} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de paiement</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {payments.length === 0 ? (
            <EmptyState
              title="Aucun paiement enregistre"
              description="Vos encaissements apparaitront ici avec leur date, la reference et la methode de reglement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
