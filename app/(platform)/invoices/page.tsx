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
        title="Émission, suivi et préparation de transmission"
        description="Créez vos factures, gérez acomptes et échéances, distinguez PDF visuel et flux structuré, puis pilotez les statuts via partenaire PDP."
      />

      <Card>
        <CardHeader>
          <CardTitle>Factures émises</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
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
        </CardContent>
      </Card>

      <DocumentEditor
        kind="invoice"
        customerOptions={customers.map((customer) => ({
          id: customer.id,
          label: customer.legalName
        }))}
        defaultValues={{
          customerId: defaults.customer.id,
          number: defaults.number,
          issueDate: "2026-04-16",
          dueDate: "2026-05-16",
          operationType: "SERVICE",
          notes:
            "Merci pour votre confiance. Cette facture peut être transmise via notre partenaire PDP connecté.",
          lines: defaults.lines
        }}
      />
    </div>
  );
}
