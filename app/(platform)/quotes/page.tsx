import { DocumentEditor } from "@/components/documents/document-editor";
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
import { listCustomers } from "@/lib/services/customer-service";
import { getDocumentComposerDefaults, listQuotes } from "@/lib/services/document-service";

export default async function QuotesPage() {
  const [quotes, defaults, customers] = await Promise.all([
    listQuotes(),
    getDocumentComposerDefaults("quote"),
    listCustomers()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Devis"
        title="Propositions commerciales haut de gamme"
        description="Numérotation propre, lignes détaillées, conversion vers facture et expérience de rédaction fluide."
      />

      <Card>
        <CardHeader>
          <CardTitle>Devis en cours</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Émission</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span>{quote.number}</span>
                      <Badge variant={quote.status === "APPROVED" ? "success" : "outline"}>
                        {quote.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{quote.customerName}</TableCell>
                  <TableCell>{formatDate(quote.issueDate)}</TableCell>
                  <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                  <TableCell>{formatCurrency(quote.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentEditor
        kind="quote"
        customerOptions={customers.map((customer) => ({
          id: customer.id,
          label: customer.legalName
        }))}
        defaultValues={{
          customerId: defaults.customer.id,
          number: defaults.number,
          issueDate: "2026-04-16",
          expiryDate: "2026-04-30",
          notes: "Pilotage premium, compte-rendu hebdomadaire et coordination conformité.",
          terms: "Validité 15 jours. 40 % à la commande, solde à 30 jours.",
          lines: defaults.lines
        }}
      />
    </div>
  );
}
