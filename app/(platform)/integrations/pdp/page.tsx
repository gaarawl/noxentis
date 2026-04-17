import { PdpConnectionButton } from "@/components/pdp/pdp-connection-button";
import { TransmitInvoiceButton } from "@/components/pdp/transmit-invoice-button";
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
import { getPdpOverview } from "@/lib/services/pdp-service";

export default async function PdpIntegrationsPage() {
  const overview = await getPdpOverview();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Integrations PDP"
        title="Couche de transmission, beaucoup plus concrete"
        description="Noxentis reste le cockpit business premium. Cette couche simule une vraie connexion partenaire, des transmissions facture et des statuts journalises."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">PDP connectee</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {overview.connected ? "Oui" : "Non"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Factures pretes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{overview.stats.ready}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Transmissions delivrees</p>
            <p className="mt-3 text-3xl font-semibold text-white">{overview.stats.delivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/45">Transmissions rejetees</p>
            <p className="mt-3 text-3xl font-semibold text-white">{overview.stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Etat de connexion</CardTitle>
          <Badge variant={overview.connected ? "success" : "warning"}>
            {overview.connected ? "Connectee" : "A connecter"}
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-white/58">
          {overview.currentConnection ? (
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{overview.currentConnection.providerName}</p>
                  <p className="mt-2">
                    Statut actuel :{" "}
                    <span className="text-white">{overview.currentConnection.status}</span>
                  </p>
                </div>
                {overview.currentConnection.status === "CONNECTED" ? (
                  <PdpConnectionButton
                    providerSlug={
                      overview.providers.find(
                        (provider) => provider.name === overview.currentConnection?.providerName
                      )?.slug || overview.providers[0].slug
                    }
                    action="disconnect"
                    label="Deconnecter"
                    variant="ghost"
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              Aucun partenaire PDP n'est encore relie a ce compte. Connectez un partenaire pour
              debloquer la transmission simulee des factures.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Connecteurs disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.providers.map((provider) => {
              const isCurrent = overview.currentConnection?.providerName === provider.name;
              const isConnected =
                isCurrent && overview.currentConnection?.status === "CONNECTED";

              return (
                <div
                  key={provider.slug}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{provider.name}</p>
                      <p className="mt-1 text-sm text-white/52">{provider.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          isConnected
                            ? "success"
                            : provider.status === "ready"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {isConnected ? "connecte" : provider.status}
                      </Badge>
                      <PdpConnectionButton
                        providerSlug={provider.slug}
                        action={isConnected ? "disconnect" : "connect"}
                        label={isConnected ? "Deconnecter" : "Connecter"}
                        variant={isConnected ? "ghost" : "secondary"}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {provider.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factures candidates a la transmission</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {overview.candidateInvoices.length === 0 ? (
              <EmptyState
                title="Aucune facture candidate"
                description="Des qu'une facture sera emise, elle apparaitra ici avec son niveau de preparation."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Etat</TableHead>
                    <TableHead>Blocages</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.candidateInvoices.slice(0, 6).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-white">{invoice.number}</p>
                          <p className="text-xs text-white/45">{formatDate(invoice.dueDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={invoice.readiness === "ready" ? "success" : "danger"}>
                            {invoice.readiness === "ready" ? "Pret" : "Bloque"}
                          </Badge>
                          <Badge variant="outline">{invoice.transmissionStatus}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.blockers.length > 0 ? (
                          <div className="space-y-1 text-xs text-white/48">
                            {invoice.blockers.slice(0, 2).map((blocker) => (
                              <p key={blocker}>{blocker}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-white/40">
                            Flux structurable
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TransmitInvoiceButton
                          invoiceId={invoice.id}
                          disabled={invoice.readiness !== "ready"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Mapping de statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.statusMapping.map((item) => (
              <div
                key={item.internal}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <span className="text-sm font-medium text-white">{item.internal}</span>
                <span className="text-sm text-white/48">{item.partner}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal de transmission</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {overview.transmissions.length === 0 ? (
              <EmptyState
                title="Aucune transmission journalisee"
                description="Les factures transmises ou rejetees apparaitront ici avec la reference partenaire et le motif."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.transmissions.slice(0, 8).map((transmission) => (
                    <TableRow key={transmission.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-white">{transmission.invoiceNumber}</p>
                          <p className="text-xs text-white/45">{transmission.customerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transmission.providerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              transmission.internalStatus === "RECEIVED"
                                ? "success"
                                : transmission.internalStatus === "REJECTED"
                                  ? "danger"
                                  : "outline"
                            }
                          >
                            {transmission.internalStatus}
                          </Badge>
                          <Badge variant="outline">{transmission.partnerStatus}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{transmission.externalReference || "-"}</TableCell>
                      <TableCell className="text-sm text-white/52">
                        {transmission.message || transmission.payloadSummary}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

