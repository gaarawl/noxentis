import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

import { formatCurrency } from "@/lib/domain/calculations";
import type { Company, Customer, Invoice, Quote } from "@/lib/domain/models";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#f4f4f2",
    color: "#111111",
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  sheet: {
    padding: 28,
    borderRadius: 18,
    backgroundColor: "#ffffff"
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24
  },
  brandEyebrow: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#6f6f73",
    letterSpacing: 1.8,
    marginBottom: 6
  },
  brandName: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4
  },
  companyMeta: {
    color: "#5a5a60",
    lineHeight: 1.5
  },
  statusCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111111",
    color: "#ffffff",
    minWidth: 120
  },
  statusLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#d0d0d5",
    letterSpacing: 1.4,
    marginBottom: 4
  },
  statusValue: {
    fontSize: 11,
    fontWeight: 700
  },
  metaGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 22
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ebebee",
    borderRadius: 14,
    padding: 14
  },
  cardLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#7a7a80",
    letterSpacing: 1.4,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4
  },
  bodyText: {
    color: "#5f5f65",
    lineHeight: 1.5
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 12
  },
  table: {
    borderWidth: 1,
    borderColor: "#ebebee",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#efeff2"
  },
  colLabel: {
    flex: 3
  },
  colQty: {
    flex: 1,
    textAlign: "right"
  },
  colUnit: {
    flex: 1.4,
    textAlign: "right"
  },
  colTax: {
    flex: 1,
    textAlign: "right"
  },
  colTotal: {
    flex: 1.4,
    textAlign: "right"
  },
  totalsBox: {
    marginLeft: "auto",
    width: 220,
    borderWidth: 1,
    borderColor: "#ebebee",
    borderRadius: 14,
    padding: 14,
    gap: 8
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  totalLabel: {
    color: "#5f5f65"
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ebebee",
    fontSize: 12,
    fontWeight: 700
  },
  notesBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ebebee",
    borderRadius: 14,
    padding: 14
  },
  footer: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#ebebee",
    color: "#6a6a70",
    lineHeight: 1.5
  }
});

function addressLabel(customer: Customer) {
  return [
    customer.billingAddress.line1,
    customer.billingAddress.postalCode,
    customer.billingAddress.city,
    customer.billingAddress.country
  ]
    .filter(Boolean)
    .join(", ");
}

function issueAndDueLabel(kind: "quote" | "invoice", document: Quote | Invoice) {
  if (kind === "quote") {
    return [
      `Emission ${document.issueDate}`,
      `Validite ${(document as Quote).expiryDate}`
    ].join(" · ");
  }

  return [`Emission ${document.issueDate}`, `Echeance ${(document as Invoice).dueDate}`].join(" · ");
}

export function PdfDocument({
  kind,
  company,
  customer,
  document
}: {
  kind: "quote" | "invoice";
  company: Company;
  customer: Customer;
  document: Quote | Invoice;
}) {
  const isInvoice = kind === "invoice";

  return (
    <Document
      title={document.number}
      author={company.brandName}
      subject={isInvoice ? "Facture premium Noxentis" : "Devis premium Noxentis"}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.sheet}>
          <View style={styles.topbar}>
            <View>
              <Text style={styles.brandEyebrow}>Noxentis document visuel</Text>
              <Text style={styles.brandName}>{company.brandName}</Text>
              <Text style={styles.companyMeta}>{company.legalName}</Text>
              <Text style={styles.companyMeta}>{company.address}</Text>
              <Text style={styles.companyMeta}>
                {company.postalCode} {company.city} - {company.country}
              </Text>
              <Text style={styles.companyMeta}>
                SIREN {company.siren} - TVA {company.vatNumber || "a completer"}
              </Text>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>{isInvoice ? "Facture" : "Devis"}</Text>
              <Text style={styles.statusValue}>{document.number}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Client</Text>
              <Text style={styles.cardTitle}>{customer.legalName}</Text>
              <Text style={styles.bodyText}>{customer.contactName}</Text>
              <Text style={styles.bodyText}>{customer.email}</Text>
              <Text style={styles.bodyText}>{addressLabel(customer)}</Text>
              {customer.siren ? <Text style={styles.bodyText}>SIREN {customer.siren}</Text> : null}
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Cadre</Text>
              <Text style={styles.cardTitle}>{issueAndDueLabel(kind, document)}</Text>
              <Text style={styles.bodyText}>
                {isInvoice
                  ? `Nature de l'operation ${(document as Invoice).operationType}`
                  : "Proposition commerciale premium"}
              </Text>
              <Text style={styles.bodyText}>Conditions {company.paymentTerms}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Prestations et lignes facturees</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colLabel}>Libelle</Text>
              <Text style={styles.colQty}>Qt</Text>
              <Text style={styles.colUnit}>PU HT</Text>
              <Text style={styles.colTax}>TVA</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {document.lines.map((line) => (
              <View key={line.id} style={styles.tableRow}>
                <View style={styles.colLabel}>
                  <Text>{line.label}</Text>
                  {line.description ? <Text style={styles.bodyText}>{line.description}</Text> : null}
                </View>
                <Text style={styles.colQty}>{line.quantity}</Text>
                <Text style={styles.colUnit}>{formatCurrency(line.unitPrice)}</Text>
                <Text style={styles.colTax}>{line.taxRate}%</Text>
                <Text style={styles.colTotal}>{formatCurrency(line.total)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text>{formatCurrency(document.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text>{formatCurrency(document.taxAmount)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text>Total TTC</Text>
              <Text>{formatCurrency(document.total)}</Text>
            </View>
          </View>

          {document.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.bodyText}>{document.notes}</Text>
            </View>
          ) : null}

          {"terms" in document && document.terms ? (
            <View style={styles.notesBox}>
              <Text style={styles.sectionTitle}>Conditions</Text>
              <Text style={styles.bodyText}>{document.terms}</Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Text>
              Ce PDF constitue le document visuel premium remis au client. Le flux electronique
              structure et sa transmission partenaire restent traites separement dans Noxentis.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
