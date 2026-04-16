import { ReminderComposer } from "@/components/reminders/reminder-composer";
import { Badge } from "@/components/ui/badge";
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
import { getReminderSnapshot } from "@/lib/services/reminder-service";

function reminderTypeLabel(value: "PRE_DUE" | "DUE_DATE" | "OVERDUE") {
  if (value === "PRE_DUE") {
    return "Avant echeance";
  }

  if (value === "DUE_DATE") {
    return "Jour d'echeance";
  }

  return "Retard";
}

export default async function RemindersPage() {
  const snapshot = await getReminderSnapshot();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Relances"
        title="Relances elegantes, sans agressivite"
        description="Programmez, envoyez et journalisez chaque relance avec un ton premium, directement depuis votre cockpit."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Relances a envoyer</p>
            <p className="mt-3 text-3xl font-semibold text-white">{snapshot.dueNow}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Relances programmees</p>
            <p className="mt-3 text-3xl font-semibold text-white">{snapshot.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Relances envoyees</p>
            <p className="mt-3 text-3xl font-semibold text-white">{snapshot.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Factures ouvertes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{snapshot.invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Declencher une relance</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshot.invoices.length === 0 ? (
            <EmptyState
              title="Aucune facture a relancer"
              description="Des qu'une facture restera ouverte, vous pourrez programmer ou envoyer une relance depuis cet espace."
            />
          ) : (
            <ReminderComposer invoices={snapshot.invoices} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Journal des relances</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {snapshot.reminders.length === 0 ? (
              <EmptyState
                title="Aucune relance journalisee"
                description="Les relances programmees ou envoyees apparaitront ici avec leur statut, leur date et leur montant."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant du</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.reminders.map((reminder) => (
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
                          {reminderTypeLabel(reminder.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reminder.status === "SENT" ? "success" : "outline"}>
                          {reminder.status === "SENT" ? "Envoyee" : "Programmee"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(reminder.sentAt || reminder.scheduledAt)}</TableCell>
                      <TableCell>{formatCurrency(reminder.amountDue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ton premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-white/58">
            <p>
              Bonjour, nous vous contactons avec courtoisie au sujet de votre facture en cours.
              Vous retrouverez son recapitulatif, son echeance et son suivi directement depuis votre
              espace client.
            </p>
            <p>
              Noxentis privilegie un ton rassurant, precis et professionnel, avec journalisation
              systematique des relances programmees et des envois immediats.
            </p>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="font-medium text-white">Quand relancer ?</p>
              <p className="mt-2">
                Avant echeance pour preparer le reglement, le jour J pour cadrer la date de paiement,
                puis en retard quand le solde reste ouvert apres la date de due.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
