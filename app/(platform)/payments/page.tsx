import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { listPayments } from "@/lib/services/payment-service";

export default function PaymentsPage() {
  const payments = listPayments();
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Paiements"
        title="Encaissements suivis proprement"
        description="Références, méthodes, dates de paiement et lecture immédiate des montants collectés."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm text-white/45">Encaissements suivis</p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(collected)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">
              Le bouton "marquer payé" et les paiements partiels peuvent être branchés à la couche Prisma et aux webhooks bancaires ou Stripe.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
