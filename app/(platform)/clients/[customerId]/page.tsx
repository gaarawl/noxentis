import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatDate } from "@/lib/domain/calculations";
import { getCustomerById, getCustomerHistory } from "@/lib/services/customer-service";

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = getCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  const history = getCustomerHistory(customerId);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Client detail"
        title={customer.legalName}
        description={`${customer.contactName} • ${customer.email} • ${customer.phone}`}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fiche client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/62">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-white/35">Type</p>
                <p className="mt-1 text-white">{customer.type}</p>
              </div>
              <div>
                <p className="text-white/35">SIREN</p>
                <p className="mt-1 text-white">{customer.siren || "À collecter"}</p>
              </div>
            </div>
            <div>
              <p className="text-white/35">Adresse de facturation</p>
              <p className="mt-1 text-white">
                {customer.billingAddress.line1}, {customer.billingAddress.postalCode}{" "}
                {customer.billingAddress.city}
              </p>
            </div>
            <div>
              <p className="text-white/35">Notes</p>
              <p className="mt-1 leading-7 text-white">{customer.notes}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique documentaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.quotes.map((quote) => (
              <div key={quote.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{quote.number}</p>
                  <Badge variant="outline">{quote.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-white/55">
                  Devis émis le {formatDate(quote.issueDate)} • Total {formatCurrency(quote.total)}
                </p>
              </div>
            ))}
            {history.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{invoice.number}</p>
                  <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "danger" : "default"}>
                    {invoice.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-white/55">
                  Facture émise le {formatDate(invoice.issueDate)} • Reste {formatCurrency(invoice.remainingAmount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
