import { Badge } from "@/components/ui/badge";
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
import { listCreditNotes } from "@/lib/services/document-service";

export default async function CreditNotesPage() {
  const creditNotes = await listCreditNotes();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Avoirs"
        title="Ajustements documentés avec sérieux"
        description="Créez des avoirs propres, rattachés aux factures d'origine et lisibles pour le client comme pour votre conformité interne."
      />

      <Card>
        <CardHeader>
          <CardTitle>Avoirs émis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNotes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span>{item.number}</span>
                      <Badge variant="outline">Avoir</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{item.invoiceNumber}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
