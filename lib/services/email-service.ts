import { formatCurrency } from "@/lib/domain/calculations";
import type { Company, Customer, Invoice, Reminder, ReminderType } from "@/lib/domain/models";
import { siteConfig } from "@/lib/config/site";
import { getExportDocument } from "@/lib/services/document-export-service";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getFromAddress(company: Company) {
  return process.env.SMTP_FROM || `${company.brandName} <${siteConfig.supportEmail}>`;
}

function reminderTypeLabel(type: ReminderType) {
  if (type === "PRE_DUE") {
    return "un rappel avant echeance";
  }

  if (type === "DUE_DATE") {
    return "un rappel a la date d'echeance";
  }

  return "une relance de paiement";
}

function emailShell({
  eyebrow,
  title,
  intro,
  body,
  ctaLabel,
  ctaUrl,
  footer
}: {
  eyebrow: string;
  title: string;
  intro: string;
  body: string[];
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
}) {
  return `<!doctype html>
  <html lang="fr">
    <body style="margin:0;background:#07080a;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f5f5f6;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#15171b,#0b0c0f);border:1px solid rgba(255,255,255,0.08);box-shadow:0 28px 80px rgba(0,0,0,0.42);">
        <tr>
          <td style="padding:32px 32px 24px;">
            <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:12px;">${eyebrow}</div>
            <div style="font-size:34px;line-height:1.05;font-weight:700;color:#ffffff;margin-bottom:14px;">${title}</div>
            <div style="font-size:16px;line-height:1.7;color:rgba(255,255,255,0.72);margin-bottom:22px;">${intro}</div>
            ${body
              .map(
                (paragraph) =>
                  `<div style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.68);margin-bottom:12px;">${paragraph}</div>`
              )
              .join("")}
            <div style="margin:28px 0 26px;">
              <a href="${ctaUrl}" style="display:inline-block;border-radius:999px;background:linear-gradient(135deg,#ffffff,#dde2ea);padding:14px 22px;font-size:14px;font-weight:700;color:#090a0c;text-decoration:none;">${ctaLabel}</a>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:18px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.46);">${footer}</div>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

async function dispatchEmail({
  to,
  from,
  subject,
  html
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: true as const,
      mode: "preview" as const,
      subject,
      html
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Email provider error");
  }

  return {
    ok: true as const,
    mode: "sent" as const,
    subject
  };
}

function buildInvoiceEmailHtml({
  company,
  customer,
  invoice,
  pdfUrl
}: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  pdfUrl: string;
}) {
  return emailShell({
    eyebrow: "Facture premium",
    title: `Facture ${invoice.number}`,
    intro: `Bonjour ${customer.contactName}, vous trouverez votre facture premium ${invoice.number} pour un montant de ${formatCurrency(invoice.total)} TTC.`,
    body: [
      `Le document visuel peut etre consulte immediatement depuis le lien ci-dessous. Son flux electronique structure est pilote separement depuis le cockpit ${company.brandName}.`,
      `Echeance de reglement : ${invoice.dueDate}. Solde actuel : ${formatCurrency(invoice.remainingAmount)}.`
    ],
    ctaLabel: "Ouvrir le document PDF",
    ctaUrl: pdfUrl,
    footer: `Envoye par ${company.brandName}. Pour toute question, repondez simplement a cet email ou contactez ${company.email || siteConfig.supportEmail}.`
  });
}

function buildReminderEmailHtml({
  company,
  customer,
  invoice,
  reminder,
  pdfUrl
}: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  reminder: Reminder;
  pdfUrl: string;
}) {
  return emailShell({
    eyebrow: "Relance premium",
    title: `Suivi de paiement ${invoice.number}`,
    intro: `Bonjour ${customer.contactName}, nous vous adressons ${reminderTypeLabel(reminder.type)} concernant votre facture ${invoice.number}.`,
    body: [
      `Le solde actuellement ouvert est de ${formatCurrency(invoice.remainingAmount)}. Vous pouvez consulter le document PDF depuis le lien ci-dessous pour retrouver le detail de la prestation.`,
      `Notre approche reste volontairement claire, courtoise et precise afin de faciliter le reglement sans friction inutile.`
    ],
    ctaLabel: "Consulter le PDF de la facture",
    ctaUrl: pdfUrl,
    footer: `Message emis par ${company.brandName}. Ce rappel est journalise dans Noxentis avec son horodatage et son statut d'envoi.`
  });
}

export async function sendInvoiceEmail(invoiceId: string) {
  const exportDocument = await getExportDocument("invoice", invoiceId);
  if (!exportDocument) {
    return {
      ok: false as const,
      message: "Facture introuvable."
    };
  }

  const pdfUrl = `${getAppUrl()}/api/documents/invoice/${exportDocument.document.id}/pdf`;
  const subject = `${exportDocument.company.brandName} - facture ${exportDocument.document.number}`;
  const html = buildInvoiceEmailHtml({
    company: exportDocument.company,
    customer: exportDocument.customer,
    invoice: exportDocument.document,
    pdfUrl
  });
  const delivery = await dispatchEmail({
    to: exportDocument.customer.email,
    from: getFromAddress(exportDocument.company),
    subject,
    html
  });

  return {
    ok: true as const,
    mode: delivery.mode,
    subject
  };
}

export async function sendReminderEmail({
  company,
  customer,
  invoice,
  reminder
}: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  reminder: Reminder;
}) {
  const pdfUrl = `${getAppUrl()}/api/documents/invoice/${invoice.id}/pdf`;
  const subject = reminder.subject;
  const html = buildReminderEmailHtml({
    company,
    customer,
    invoice,
    reminder,
    pdfUrl
  });

  return dispatchEmail({
    to: customer.email,
    from: getFromAddress(company),
    subject,
    html
  });
}
