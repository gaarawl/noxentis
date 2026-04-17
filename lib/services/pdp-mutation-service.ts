import { pdpProviders } from "@/lib/data/demo-data";
import type { Company, Customer, Invoice } from "@/lib/domain/models";
import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import { requireCurrentSession } from "@/lib/services/auth-service";
import {
  buildTransmissionPayloadSummary,
  getTransmissionBlockers
} from "@/lib/services/pdp-rules";

function toCompany(input: {
  id: string;
  ownerId: string;
  legalName: string;
  brandName: string;
  siren: string;
  vatNumber: string | null;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentTerms: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  activityLabel: string | null;
  tvaOnDebits: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Company {
  return {
    id: input.id,
    ownerId: input.ownerId,
    legalName: input.legalName,
    brandName: input.brandName,
    siren: input.siren,
    vatNumber: input.vatNumber || "",
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    country: input.country,
    paymentTerms: input.paymentTerms,
    logoUrl: input.logoUrl || undefined,
    email: input.email || "",
    phone: input.phone || "",
    activityLabel: input.activityLabel || "",
    tvaOnDebits: input.tvaOnDebits,
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString()
  };
}

function readAddress(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {
      line1: "",
      city: "",
      postalCode: "",
      country: "France"
    };
  }

  return {
    line1: "line1" in value && typeof value.line1 === "string" ? value.line1 : "",
    line2: "line2" in value && typeof value.line2 === "string" ? value.line2 : undefined,
    city: "city" in value && typeof value.city === "string" ? value.city : "",
    postalCode:
      "postalCode" in value && typeof value.postalCode === "string" ? value.postalCode : "",
    country: "country" in value && typeof value.country === "string" ? value.country : "France"
  };
}

function toCustomer(input: {
  id: string;
  companyId: string;
  type: Customer["type"];
  legalName: string;
  contactName: string;
  email: string;
  phone: string | null;
  siren: string | null;
  vatNumber: string | null;
  billingAddress: unknown;
  deliveryAddress: unknown;
  notes: string | null;
  tags: string[];
  status: Customer["status"];
  createdAt: Date;
  updatedAt: Date;
}): Customer {
  return {
    id: input.id,
    companyId: input.companyId,
    type: input.type,
    legalName: input.legalName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone || "",
    siren: input.siren || undefined,
    vatNumber: input.vatNumber || undefined,
    billingAddress: readAddress(input.billingAddress),
    deliveryAddress: input.deliveryAddress ? readAddress(input.deliveryAddress) : undefined,
    notes: input.notes || "",
    tags: input.tags,
    status: input.status,
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString()
  };
}

function toInvoice(input: {
  id: string;
  companyId: string;
  customerId: string;
  quoteId: string | null;
  number: string;
  type: Invoice["type"];
  status: Invoice["status"];
  issueDate: Date;
  dueDate: Date;
  subtotal: { toString(): string } | number;
  taxAmount: { toString(): string } | number;
  total: { toString(): string } | number;
  paidAmount: { toString(): string } | number;
  remainingAmount: { toString(): string } | number;
  complianceStatus: Invoice["complianceStatus"];
  transmissionStatus: Invoice["transmissionStatus"];
  pdpStatus: Invoice["pdpStatus"];
  operationType: Invoice["operationType"];
  deliveryAddressNote: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  lines: Array<{
    id: string;
    label: string;
    description: string | null;
    quantity: { toString(): string } | number;
    unitPrice: { toString(): string } | number;
    taxRate: { toString(): string } | number;
    discount: { toString(): string } | number | null;
    total: { toString(): string } | number;
  }>;
}): Invoice {
  return {
    id: input.id,
    companyId: input.companyId,
    customerId: input.customerId,
    quoteId: input.quoteId || undefined,
    number: input.number,
    type: input.type,
    status: input.status,
    issueDate: input.issueDate.toISOString(),
    dueDate: input.dueDate.toISOString(),
    subtotal: Number(input.subtotal),
    taxAmount: Number(input.taxAmount),
    total: Number(input.total),
    paidAmount: Number(input.paidAmount),
    remainingAmount: Number(input.remainingAmount),
    complianceStatus: input.complianceStatus,
    transmissionStatus: input.transmissionStatus,
    pdpStatus: input.pdpStatus,
    operationType: input.operationType,
    deliveryAddressNote: input.deliveryAddressNote || undefined,
    notes: input.notes || "",
    lines: input.lines.map((line) => ({
      id: line.id,
      label: line.label,
      description: line.description || undefined,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      taxRate: Number(line.taxRate),
      discount: line.discount ? Number(line.discount) : 0,
      total: Number(line.total)
    })),
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString()
  };
}

async function requirePdpContext() {
  const session = await requireCurrentSession();
  const prisma = getPrisma();
  const company = await prisma.company.findFirst({
    where: {
      id: session.companyId,
      ownerId: session.userId
    }
  });

  if (!company) {
    throw new Error("Entreprise introuvable.");
  }

  return { prisma, company, session };
}

async function createAuditLog(input: {
  companyId: string;
  invoiceId?: string;
  category: "PDP" | "TRANSMISSION" | "COMPLIANCE";
  level: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
  title: string;
  detail: string;
}) {
  const prisma = getPrisma();

  await prisma.complianceAuditLog.create({
    data: {
      companyId: input.companyId,
      invoiceId: input.invoiceId || null,
      category: input.category,
      level: input.level,
      title: input.title,
      detail: input.detail
    }
  });
}

export async function connectPdpProvider(providerSlug: string) {
  const provider = pdpProviders.find((item) => item.slug === providerSlug);
  if (!provider) {
    return {
      ok: false as const,
      message: "Connecteur PDP introuvable."
    };
  }

  if (!isLiveMode()) {
    return {
      ok: true as const,
      message: `${provider.name} est pret en mode simulation.`
    };
  }

  const { prisma, company } = await requirePdpContext();

  await prisma.$transaction(async (tx) => {
    await tx.pdpConnection.updateMany({
      where: {
        companyId: company.id
      },
      data: {
        status: "NOT_CONNECTED"
      }
    });

    const existing = await tx.pdpConnection.findFirst({
      where: {
        companyId: company.id,
        providerName: provider.name
      }
    });

    if (existing) {
      await tx.pdpConnection.update({
        where: { id: existing.id },
        data: {
          status: "CONNECTED",
          credentialsEncrypted: `simulation:${provider.slug}:${Date.now()}`
        }
      });
    } else {
      await tx.pdpConnection.create({
        data: {
          companyId: company.id,
          providerName: provider.name,
          status: "CONNECTED",
          credentialsEncrypted: `simulation:${provider.slug}:${Date.now()}`
        }
      });
    }
  });

  await createAuditLog({
    companyId: company.id,
    category: "PDP",
    level: "SUCCESS",
    title: "Partenaire PDP connecte",
    detail: `${provider.name} est maintenant actif pour les transmissions simulees et le suivi de statuts.`
  });

  return {
    ok: true as const,
    message: `${provider.name} est maintenant connecte.`
  };
}

export async function disconnectPdpProvider(providerSlug?: string) {
  if (!isLiveMode()) {
    return {
      ok: true as const,
      message: "Mode simulation desactive pour la connexion PDP."
    };
  }

  const { prisma, company } = await requirePdpContext();
  const current = await prisma.pdpConnection.findFirst({
    where: {
      companyId: company.id,
      ...(providerSlug
        ? { providerName: pdpProviders.find((item) => item.slug === providerSlug)?.name }
        : { status: "CONNECTED" })
    }
  });

  if (!current) {
    return {
      ok: false as const,
      message: "Aucune connexion PDP active a deconnecter."
    };
  }

  await prisma.pdpConnection.update({
    where: { id: current.id },
    data: { status: "NOT_CONNECTED" }
  });

  await createAuditLog({
    companyId: company.id,
    category: "PDP",
    level: "WARNING",
    title: "Partenaire PDP deconnecte",
    detail: `${current.providerName} a ete repasse en mode non connecte.`
  });

  return {
    ok: true as const,
    message: `${current.providerName} a ete deconnecte.`
  };
}

export async function simulateInvoiceTransmission(invoiceId: string) {
  if (!isLiveMode()) {
    return {
      ok: true as const,
      message: "Transmission simulee en mode preview."
    };
  }

  const { prisma, company } = await requirePdpContext();
  const connection = await prisma.pdpConnection.findFirst({
    where: {
      companyId: company.id,
      status: "CONNECTED"
    }
  });

  if (!connection) {
    return {
      ok: false as const,
      message: "Connectez une PDP partenaire avant de transmettre une facture."
    };
  }

  const invoiceRecord = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      companyId: company.id
    },
    include: {
      customer: true,
      lines: true
    }
  });

  if (!invoiceRecord) {
    return {
      ok: false as const,
      message: "Facture introuvable."
    };
  }

  const companyModel = toCompany(company);
  const customerModel = toCustomer(invoiceRecord.customer);
  const invoiceModel = toInvoice(invoiceRecord);
  const blockers = getTransmissionBlockers({
    company: companyModel,
    customer: customerModel,
    invoice: invoiceModel,
    connected: true
  });
  const payloadSummary = buildTransmissionPayloadSummary(invoiceModel, customerModel);
  const externalReference = `SIM-${invoiceModel.number.replace(/[^A-Z0-9]/gi, "")}-${Date.now()}`;

  if (blockers.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceRecord.id },
        data: {
          transmissionStatus: "REJECTED",
          pdpStatus: "ERROR",
          complianceStatus: "NOT_READY"
        }
      });

      await tx.pdpTransmission.create({
        data: {
          companyId: company.id,
          invoiceId: invoiceRecord.id,
          pdpConnectionId: connection.id,
          providerName: connection.providerName,
          internalStatus: "REJECTED",
          partnerStatus: "validation_failed",
          externalReference,
          payloadSummary,
          message: blockers[0]
        }
      });
    });

    await createAuditLog({
      companyId: company.id,
      invoiceId: invoiceRecord.id,
      category: "TRANSMISSION",
      level: "WARNING",
      title: "Transmission rejetee",
      detail: `${invoiceModel.number} reste bloquee : ${blockers[0]}`
    });

    return {
      ok: false as const,
      message: blockers[0]
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceRecord.id },
      data: {
        transmissionStatus: "RECEIVED",
        pdpStatus: "CONNECTED",
        complianceStatus:
          invoiceRecord.complianceStatus === "NOT_READY" ? "PARTIALLY_READY" : "READY"
      }
    });

    await tx.pdpTransmission.create({
      data: {
        companyId: company.id,
        invoiceId: invoiceRecord.id,
        pdpConnectionId: connection.id,
        providerName: connection.providerName,
        internalStatus: "RECEIVED",
        partnerStatus: "delivered_to_customer_platform",
        externalReference,
        payloadSummary,
        message: "Transmission acceptee puis distribuee au partenaire simule."
      }
    });
  });

  await createAuditLog({
    companyId: company.id,
    invoiceId: invoiceRecord.id,
    category: "TRANSMISSION",
    level: "SUCCESS",
    title: "Transmission acceptee",
    detail: `${invoiceModel.number} a ete transmise avec succes via ${connection.providerName}.`
  });

  return {
    ok: true as const,
    message: `${invoiceModel.number} a ete transmise via ${connection.providerName}.`
  };
}

