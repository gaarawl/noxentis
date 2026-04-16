import type { Prisma } from "@prisma/client";
import { addDays } from "date-fns";

import { calculateDocumentTotals } from "@/lib/domain/calculations";
import {
  accountSchema,
  companyProfileSchema,
  customerImportSchema,
  customerSchema,
  invoiceEditorSchema,
  paymentSchema,
  quoteEditorSchema
} from "@/lib/domain/validators";
import { normalizeEmail } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import { requireCurrentSession } from "@/lib/services/auth-service";
import { createSession } from "@/lib/session";

function parseTags(value: string) {
  return value
    .split(/[,|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function detectDelimiter(headerLine: string) {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;

  return semicolons >= commas ? ";" : ",";
}

function splitCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());

  return cells;
}

function mapImportedType(value: string) {
  const normalized = normalizeHeader(value);
  if (["individual", "particulier", "personnephysique"].includes(normalized)) {
    return "INDIVIDUAL" as const;
  }

  return "COMPANY" as const;
}

const customerImportAliases = {
  type: ["type", "customertype", "nature", "categorie"],
  legalName: ["legalname", "nom", "client", "raisonsociale", "societe", "companyname"],
  contactName: ["contactname", "contact", "nomcontact", "referent"],
  email: ["email", "mail", "courriel"],
  phone: ["phone", "telephone", "tel", "mobile"],
  siren: ["siren"],
  vatNumber: ["vatnumber", "vat", "tva", "tvaintracommunautaire"],
  billingAddressLine1: [
    "billingaddressline1",
    "adresse",
    "adressefacturation",
    "billingaddress",
    "address"
  ],
  billingCity: ["billingcity", "ville", "city"],
  billingPostalCode: ["billingpostalcode", "codepostal", "postalcode", "cp"],
  notes: ["notes", "commentaire", "comments"],
  tags: ["tags", "etiquettes", "labels"]
} as const;

function readImportedValue(record: Map<string, string>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const value = record.get(alias);
    if (value) {
      return value;
    }
  }

  return "";
}

async function requireLiveContext() {
  const session = await requireCurrentSession();
  const prisma = getPrisma();
  const company = await prisma.company.findFirst({
    where: {
      id: session.companyId,
      ownerId: session.userId
    }
  });

  if (!company) {
    throw new Error("Entreprise introuvable pour ce compte.");
  }

  return { prisma, session, company };
}

async function ensureCustomerOwnership(prisma: ReturnType<typeof getPrisma>, companyId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId
    },
    select: {
      id: true
    }
  });

  return Boolean(customer);
}

function toLineCreateInput(
  line:
    | Awaited<ReturnType<typeof quoteEditorSchema.parse>>["lines"][number]
    | Awaited<ReturnType<typeof invoiceEditorSchema.parse>>["lines"][number]
): Prisma.QuoteLineCreateWithoutQuoteInput & Prisma.InvoiceLineCreateWithoutInvoiceInput {
  return {
    label: line.label,
    description: line.description,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    taxRate: line.taxRate,
    discount: line.discount || 0,
    total: line.total
  };
}

function resolvePaymentTermsDays(paymentTerms: string) {
  const match = paymentTerms.match(/(\d{1,3})/);
  return match ? Number(match[1]) : 30;
}

async function getNextInvoiceNumber(prisma: ReturnType<typeof getPrisma>, companyId: string) {
  const count = await prisma.invoice.count({
    where: { companyId }
  });

  return `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
}

function getInvoiceStatusAfterPayment(dueDate: Date, remainingAmount: number, paidAmount: number) {
  if (remainingAmount <= 0) {
    return "PAID" as const;
  }

  if (paidAmount > 0) {
    return "PARTIALLY_PAID" as const;
  }

  return dueDate.getTime() < Date.now() ? ("OVERDUE" as const) : ("ISSUED" as const);
}

export async function saveAccountProfile(payload: unknown) {
  const parsed = accountSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Compte invalide."
    };
  }

  const session = await requireCurrentSession();

  if (!isLiveMode()) {
    await createSession({
      ...session,
      email: normalizeEmail(parsed.data.email),
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim()
    });

    return { ok: true as const };
  }

  const prisma = getPrisma();
  const normalizedEmail = normalizeEmail(parsed.data.email);
  const duplicate = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      NOT: {
        id: session.userId
      }
    },
    select: {
      id: true
    }
  });

  if (duplicate) {
    return {
      ok: false as const,
      message: "Cette adresse email est déjà utilisée par un autre compte."
    };
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: session.userId
    },
    data: {
      email: normalizedEmail,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim()
    }
  });

  await createSession({
    ...session,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName
  });

  return { ok: true as const };
}

export async function saveCompanyProfile(payload: unknown) {
  const parsed = companyProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Profil société invalide."
    };
  }

  if (!isLiveMode()) {
    return { ok: true as const, data: parsed.data };
  }

  const { prisma, company, session } = await requireLiveContext();

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: parsed.data
  });

  await createSession({
    ...session,
    companyName: updated.brandName
  });

  return { ok: true as const, data: updated };
}

export async function createCustomerRecord(payload: unknown) {
  const parsed = customerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Client invalide."
    };
  }

  if (!isLiveMode()) {
    return { ok: true as const, data: parsed.data };
  }

  const { prisma, company } = await requireLiveContext();

  const customer = await prisma.customer.create({
    data: {
      companyId: company.id,
      type: parsed.data.type,
      status: "ACTIVE",
      legalName: parsed.data.legalName,
      contactName: parsed.data.contactName,
      email: normalizeEmail(parsed.data.email),
      phone: parsed.data.phone,
      siren: parsed.data.siren || null,
      vatNumber: parsed.data.vatNumber || null,
      billingAddress: {
        line1: parsed.data.billingAddressLine1,
        city: parsed.data.billingCity,
        postalCode: parsed.data.billingPostalCode,
        country: "France"
      } as Prisma.InputJsonValue,
      notes: parsed.data.notes,
      tags: parseTags(parsed.data.tags)
    }
  });

  return { ok: true as const, data: customer };
}

export async function importCustomerRecords(payload: unknown) {
  const parsed = customerImportSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Import invalide."
    };
  }

  const lines = parsed.data.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      ok: false as const,
      message: "Le CSV doit contenir au moins une ligne d'en-têtes et une ligne de données."
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const errors: string[] = [];
  let importedCount = 0;

  if (!isLiveMode()) {
    return {
      ok: true as const,
      data: {
        importedCount: lines.length - 1,
        errorCount: 0,
        errors: []
      }
    };
  }

  const { prisma, company } = await requireLiveContext();

  for (const [index, line] of lines.slice(1).entries()) {
    const rawCells = splitCsvLine(line, delimiter);
    const record = new Map<string, string>();

    headers.forEach((header, cellIndex) => {
      record.set(header, rawCells[cellIndex]?.trim() || "");
    });

    const candidate = {
      type: mapImportedType(readImportedValue(record, customerImportAliases.type)),
      legalName: readImportedValue(record, customerImportAliases.legalName),
      contactName:
        readImportedValue(record, customerImportAliases.contactName) ||
        readImportedValue(record, customerImportAliases.legalName),
      email: readImportedValue(record, customerImportAliases.email),
      phone: readImportedValue(record, customerImportAliases.phone) || "+33 0 00 00 00 00",
      siren: readImportedValue(record, customerImportAliases.siren),
      vatNumber: readImportedValue(record, customerImportAliases.vatNumber),
      billingAddressLine1: readImportedValue(record, customerImportAliases.billingAddressLine1),
      billingCity: readImportedValue(record, customerImportAliases.billingCity) || "Paris",
      billingPostalCode:
        readImportedValue(record, customerImportAliases.billingPostalCode) || "75000",
      notes: readImportedValue(record, customerImportAliases.notes),
      tags: readImportedValue(record, customerImportAliases.tags) || "Import"
    };

    const validated = customerSchema.safeParse(candidate);
    if (!validated.success) {
      errors.push(
        `Ligne ${index + 2} : ${validated.error.issues[0]?.message || "données invalides"}.`
      );
      continue;
    }

    await prisma.customer.create({
      data: {
        companyId: company.id,
        type: validated.data.type,
        status: "ACTIVE",
        legalName: validated.data.legalName,
        contactName: validated.data.contactName,
        email: normalizeEmail(validated.data.email),
        phone: validated.data.phone,
        siren: validated.data.siren || null,
        vatNumber: validated.data.vatNumber || null,
        billingAddress: {
          line1: validated.data.billingAddressLine1,
          city: validated.data.billingCity,
          postalCode: validated.data.billingPostalCode,
          country: "France"
        } as Prisma.InputJsonValue,
        notes: validated.data.notes,
        tags: parseTags(validated.data.tags)
      }
    });

    importedCount += 1;
  }

  return {
    ok: true as const,
    data: {
      importedCount,
      errorCount: errors.length,
      errors
    }
  };
}

export async function createQuoteRecord(payload: unknown) {
  const parsed = quoteEditorSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Devis invalide."
    };
  }

  if (!isLiveMode()) {
    return { ok: true as const, data: parsed.data };
  }

  const { prisma, company } = await requireLiveContext();
  const customerExists = await ensureCustomerOwnership(prisma, company.id, parsed.data.customerId);
  if (!customerExists) {
    return {
      ok: false as const,
      message: "Le client sélectionné n'appartient pas à votre entreprise."
    };
  }

  const totals = calculateDocumentTotals(parsed.data.lines);

  const quote = await prisma.quote.create({
    data: {
      companyId: company.id,
      customerId: parsed.data.customerId,
      number: parsed.data.number,
      status: "DRAFT",
      issueDate: new Date(parsed.data.issueDate),
      expiryDate: new Date(parsed.data.expiryDate),
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes: parsed.data.notes,
      terms: parsed.data.terms,
      lines: {
        create: parsed.data.lines.map((line) => toLineCreateInput(line))
      }
    },
    include: {
      lines: true
    }
  });

  return { ok: true as const, data: quote };
}

export async function createInvoiceRecord(payload: unknown) {
  const parsed = invoiceEditorSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Facture invalide."
    };
  }

  if (!isLiveMode()) {
    return { ok: true as const, data: parsed.data };
  }

  const { prisma, company } = await requireLiveContext();
  const customerExists = await ensureCustomerOwnership(prisma, company.id, parsed.data.customerId);
  if (!customerExists) {
    return {
      ok: false as const,
      message: "Le client sélectionné n'appartient pas à votre entreprise."
    };
  }

  const totals = calculateDocumentTotals(parsed.data.lines);

  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: parsed.data.customerId,
      number: parsed.data.number,
      type: "STANDARD",
      status: "DRAFT",
      issueDate: new Date(parsed.data.issueDate),
      dueDate: new Date(parsed.data.dueDate),
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      paidAmount: 0,
      remainingAmount: totals.total,
      complianceStatus: "PARTIALLY_READY",
      transmissionStatus: "NOT_READY",
      pdpStatus: "NOT_CONNECTED",
      operationType: parsed.data.operationType,
      notes: parsed.data.notes,
      lines: {
        create: parsed.data.lines.map((line) => toLineCreateInput(line))
      }
    },
    include: {
      lines: true
    }
  });

  return { ok: true as const, data: invoice };
}

export async function recordInvoicePayment(payload: unknown) {
  const parsed = paymentSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Paiement invalide."
    };
  }

  if (!isLiveMode()) {
    return { ok: true as const, data: parsed.data };
  }

  const { prisma, company } = await requireLiveContext();
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: parsed.data.invoiceId,
      companyId: company.id
    },
    select: {
      id: true,
      number: true,
      total: true,
      paidAmount: true,
      remainingAmount: true,
      dueDate: true,
      status: true
    }
  });

  if (!invoice) {
    return {
      ok: false as const,
      message: "Facture introuvable."
    };
  }

  if (invoice.status === "CANCELLED") {
    return {
      ok: false as const,
      message: "Cette facture est annulee et ne peut pas recevoir de paiement."
    };
  }

  const amount = Number(parsed.data.amount.toFixed(2));
  const currentRemaining = Number(invoice.remainingAmount);

  if (currentRemaining <= 0) {
    return {
      ok: false as const,
      message: "Cette facture est deja entierement reglee."
    };
  }

  if (amount > currentRemaining) {
    return {
      ok: false as const,
      message: `Le montant depasse le solde restant de ${currentRemaining.toFixed(2)} EUR.`
    };
  }

  const nextPaidAmount = Number((Number(invoice.paidAmount) + amount).toFixed(2));
  const nextRemainingAmount = Number(Math.max(0, currentRemaining - amount).toFixed(2));
  const nextStatus = getInvoiceStatusAfterPayment(
    invoice.dueDate,
    nextRemainingAmount,
    nextPaidAmount
  );

  const payment = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        method: parsed.data.method,
        paidAt: new Date(parsed.data.paidAt),
        reference: parsed.data.reference?.trim() || null
      }
    });

    await tx.invoice.update({
      where: {
        id: invoice.id
      },
      data: {
        paidAmount: nextPaidAmount,
        remainingAmount: nextRemainingAmount,
        status: nextStatus
      }
    });

    return createdPayment;
  });

  return {
    ok: true as const,
    data: {
      id: payment.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount,
      remainingAmount: nextRemainingAmount,
      status: nextStatus
    }
  };
}

export async function convertQuoteToInvoiceRecord(quoteId: string) {
  if (!isLiveMode()) {
    return {
      ok: false as const,
      message: "La conversion de devis en facture n'est disponible qu'en mode live."
    };
  }

  const { prisma, company } = await requireLiveContext();
  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      companyId: company.id
    },
    include: {
      customer: true,
      lines: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!quote) {
    return {
      ok: false as const,
      message: "Devis introuvable."
    };
  }

  if (quote.invoices[0]) {
    return {
      ok: false as const,
      message: `Ce devis a deja ete converti en ${quote.invoices[0].number}.`
    };
  }

  if (quote.status === "DECLINED" || quote.status === "EXPIRED") {
    return {
      ok: false as const,
      message: "Ce devis ne peut pas etre converti dans son statut actuel."
    };
  }

  const invoiceNumber = await getNextInvoiceNumber(prisma, company.id);
  const issueDate = new Date();
  const dueDate = addDays(issueDate, resolvePaymentTermsDays(company.paymentTerms));
  const pdpConnected = Boolean(
    await prisma.pdpConnection.findFirst({
      where: {
        companyId: company.id,
        status: "CONNECTED"
      },
      select: { id: true }
    })
  );

  const invoice = await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quote.id },
      data: {
        status: quote.status === "DRAFT" ? "APPROVED" : quote.status
      }
    });

    return tx.invoice.create({
      data: {
        companyId: company.id,
        customerId: quote.customerId,
        quoteId: quote.id,
        number: invoiceNumber,
        type: "STANDARD",
        status: "ISSUED",
        issueDate,
        dueDate,
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        total: quote.total,
        paidAmount: 0,
        remainingAmount: quote.total,
        complianceStatus: "PARTIALLY_READY",
        transmissionStatus: pdpConnected ? "READY" : "NOT_READY",
        pdpStatus: pdpConnected ? "CONNECTED" : "NOT_CONNECTED",
        operationType: "SERVICE",
        notes: quote.notes,
        lines: {
          create: quote.lines.map((line) => ({
            label: line.label,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            discount: line.discount,
            total: line.total
          }))
        }
      },
      include: {
        lines: true
      }
    });
  });

  return { ok: true as const, data: invoice };
}
