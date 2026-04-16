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
import { listReminders } from "@/lib/services/payment-service";

export default function RemindersPage() {
  const reminders = listReminders();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Relances"
        title="Relances élégantes, sans agressivité"
        description="Avant échéance, à l'échéance et après retard, avec une trace claire et un ton premium."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Journal des relances</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Programmée</TableHead>
                  <TableHead>Montant dû</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>{reminder.invoiceNumber}</TableCell>
                    <TableCell>{reminder.customerName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reminder.type === "OVERDUE"
                            ? "danger"
                            : reminder.type === "PRE_DUE"
                              ? "warning"
                              : "default"
                        }
                      >
                        {reminder.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(reminder.scheduledAt)}</TableCell>
                    <TableCell>{formatCurrency(reminder.amountDue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modèle premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-white/58">
            <p>
              Bonjour, nous vous rappelons avec courtoisie que la facture concernée arrive à échéance.
              Vous retrouverez ci-joint votre document visuel ainsi que son suivi dans votre espace client.
            </p>
            <p>
              Noxentis privilégie un ton rassurant, précis et professionnel, avec journalisation
              systématique des relances programmées et envoyées.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
