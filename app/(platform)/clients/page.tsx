import Link from "next/link";

import { CustomerForm } from "@/components/forms/customer-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/domain/calculations";
import { listCustomers } from "@/lib/services/customer-service";

export default async function ClientsPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Clients"
        title="CRM leger, clair et premium"
        description="Coordonnees, SIREN, tags, historique, balance ouverte et donnees de conformite dans une vue dense mais sereine."
        action={
          <Link href="/clients/import">
            <Button>Importer des clients</Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Portefeuille client</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Balance ouverte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/clients/${customer.id}`} className="space-y-1">
                        <p className="font-medium text-white">{customer.legalName}</p>
                        <p className="text-xs text-white/45">
                          {customer.contactName} • {customer.email}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "ACTIVE" ? "success" : "outline"}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(customer.openBalance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau client</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
