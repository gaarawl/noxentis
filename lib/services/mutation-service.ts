import type { Prisma, User } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import { calculateDocumentTotals } from "@/lib/domain/calculations";
import {
  companyProfileSchema,
  customerSchema,
  invoiceEditorSchema,
  quoteEditorSchema
} from "@/lib/domain/validators";

async function getOrCreateOwner() {
  const prisma = getPrisma();
  let owner = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: "owner@noxentis.local",
        passwordHash: "pending-setup",
        firstName: "Clara",
        lastName: "Martin",
        role: "OWNER"
      }
    });
  }

  return owner;
}

async function getOrCreateCompany(owner: User) {
  const prisma = getPrisma();
  const existing = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (existing) {
    return existing;
  }

  return prisma.company.create({
    data: {
      ownerId: owner.id,
      legalName: "Maison Serein Studio SAS",
      brandName: "Maison Serein Studio",
      siren: "921456783",
      vatNumber: "FR50921456783",
      address: "18 rue du Faubourg Poissonnière",
      city: "Paris",
      postalCode: "75010",
      country: "France",
      paymentTerms: "Paiement à 30 jours fin de mois",
      email: "finance@maisonserein.fr",
      phone: "+33 1 84 80 28 10",
      activityLabel: "Conseil, design produit et accompagnement conformité",
      tvaOnDebits: true
    }
  });
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
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

  const prisma = getPrisma();
  const owner = await getOrCreateOwner();
  const company = await getOrCreateCompany(owner);

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: parsed.data
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

  const prisma = getPrisma();
  const owner = await getOrCreateOwner();
  const company = await getOrCreateCompany(owner);

  const customer = await prisma.customer.create({
    data: {
      companyId: company.id,
      type: parsed.data.type,
      status: "ACTIVE",
      legalName: parsed.data.legalName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
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

  const prisma = getPrisma();
  const owner = await getOrCreateOwner();
  const company = await getOrCreateCompany(owner);
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

  const prisma = getPrisma();
  const owner = await getOrCreateOwner();
  const company = await getOrCreateCompany(owner);
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
