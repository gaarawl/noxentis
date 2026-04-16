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
import { getDocumentComposerDefaults, listInvoices } from "@/lib/services/document-service";

export default async function InvoicesPage() {
  const [invoices, defaults, customers] = await Promise.all([
    listInvoices(),
    getDocumentComposerDefaults("invoice"),
    listCustomers()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Factures"
        title="Emission, suivi et preparation de transmission"
        description="Creez vos factures, gerez acomptes et echeances, distinguez PDF visuel et flux structure, puis pilotez les statuts via partenaire PDP."
      />

      <Card>
        <CardHeader>
          <CardTitle>Factures emises</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {invoices.length === 0 ? (
            <EmptyState
              title="Aucune facture pour l'instant"
              description="Vos factures émises et leurs statuts apparaîtront ici dès la première émission."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Echeance</TableHead>
                  <TableHead>Reste</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-white">{invoice.number}</p>
                        <p className="text-xs text-white/45">{invoice.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            invoice.status === "PAID"
                              ? "success"
                              : invoice.status === "OVERDUE"
                                ? "danger"
                                : "default"
                          }
                        >
                          {invoice.status}
                        </Badge>
                        <Badge variant="outline">{invoice.transmissionStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.remainingAmount)}</TableCell>
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
          description="Une facture doit toujours être rattachée à une fiche client. Créez votre premier client pour ouvrir l'éditeur."
          action={
            <Link href="/clients">
              <Button>Creer un client</Button>
            </Link>
          }
        />
      ) : (
        <DocumentEditor
          kind="invoice"
          customerOptions={customers.map((customer) => ({
            id: customer.id,
            label: customer.legalName
          }))}
          defaultValues={{
            customerId: defaults.customer?.id || "",
            number: defaults.number,
            issueDate: defaults.issueDate,
            dueDate: defaults.dueDate,
            operationType: "SERVICE",
            notes: defaults.notes,
            lines: defaults.lines
          }}
        />
      )}
    </div>
  );
}
