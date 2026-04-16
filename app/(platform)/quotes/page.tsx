import Link from "next/link";

import { DocumentEditor } from "@/components/documents/document-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        description="Numerotation propre, lignes detaillees, conversion vers facture et experience de redaction fluide."
      />

      <Card>
        <CardHeader>
          <CardTitle>Devis en cours</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {quotes.length === 0 ? (
            <EmptyState
              title="Aucun devis pour l'instant"
              description="Votre premier devis apparaitra ici dès que vous aurez commencé à chiffrer une proposition."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Emission</TableHead>
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
          )}
        </CardContent>
      </Card>

      {customers.length === 0 ? (
        <EmptyState
          title="Ajoutez d'abord un client"
          description="Un devis doit toujours être rattaché à une fiche client. Commencez par créer votre premier client pour débloquer l'éditeur."
          action={
            <Link href="/clients">
              <Button>Creer un client</Button>
            </Link>
          }
        />
      ) : (
        <DocumentEditor
          kind="quote"
          customerOptions={customers.map((customer) => ({
            id: customer.id,
            label: customer.legalName
          }))}
          defaultValues={{
            customerId: defaults.customer?.id || "",
            number: defaults.number,
            issueDate: defaults.issueDate,
            expiryDate: defaults.expiryDate,
            notes: defaults.notes,
            terms: defaults.terms,
            lines: defaults.lines
          }}
        />
      )}
    </div>
  );
}
