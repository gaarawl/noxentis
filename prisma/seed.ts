import { Prisma, PrismaClient } from "@prisma/client";

import {
  demoBillingEvents,
  demoCompany,
  demoComplianceCheck,
  demoComplianceAuditLogs,
  demoCreditNotes,
  demoCustomers,
  demoEmailDeliveries,
  demoInvoices,
  demoPayments,
  demoPdpConnections,
  demoPdpTransmissions,
  demoQuotes,
  demoReminders
} from "../lib/data/demo-data";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.complianceAuditLog.deleteMany();
  await prisma.pdpTransmission.deleteMany();
  await prisma.emailDelivery.deleteMany();
  await prisma.billingEvent.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.creditNote.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.complianceCheck.deleteMany();
  await prisma.pdpConnection.deleteMany();
  await prisma.billingSubscription.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "clara@maisonserein.fr",
      passwordHash: hashPassword("demo-password"),
      firstName: "Clara",
      lastName: "Martin",
      role: "OWNER"
    }
  });

  const company = await prisma.company.create({
    data: {
      ownerId: user.id,
      legalName: demoCompany.legalName,
      brandName: demoCompany.brandName,
      siren: demoCompany.siren,
      vatNumber: demoCompany.vatNumber,
      address: demoCompany.address,
      city: demoCompany.city,
      postalCode: demoCompany.postalCode,
      country: demoCompany.country,
      paymentTerms: demoCompany.paymentTerms,
      email: demoCompany.email,
      phone: demoCompany.phone,
      activityLabel: demoCompany.activityLabel,
      tvaOnDebits: demoCompany.tvaOnDebits
    }
  });

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.billingSubscription.create({
    data: {
      companyId: company.id,
      plan: "PRO",
      status: "TRIALING",
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
      seats: 5
    }
  });

  const customerMap = new Map<string, string>();

  for (const customer of demoCustomers) {
    const created = await prisma.customer.create({
      data: {
        companyId: company.id,
        type: customer.type,
        status: customer.status,
        legalName: customer.legalName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        siren: customer.siren,
        vatNumber: customer.vatNumber,
        billingAddress: customer.billingAddress as unknown as Prisma.InputJsonValue,
        deliveryAddress: customer.deliveryAddress
          ? (customer.deliveryAddress as unknown as Prisma.InputJsonValue)
          : undefined,
        notes: customer.notes,
        tags: customer.tags
      }
    });

    customerMap.set(customer.id, created.id);
  }

  const quoteMap = new Map<string, string>();
  const invoiceMap = new Map<string, string>();
  const reminderMap = new Map<string, string>();
  const pdpConnectionMap = new Map<string, string>();

  for (const quote of demoQuotes) {
    const created = await prisma.quote.create({
      data: {
        companyId: company.id,
        customerId: customerMap.get(quote.customerId)!,
        number: quote.number,
        status: quote.status,
        issueDate: new Date(quote.issueDate),
        expiryDate: new Date(quote.expiryDate),
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        total: quote.total,
        notes: quote.notes,
        terms: quote.terms,
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
      }
    });

    quoteMap.set(quote.id, created.id);
  }

  for (const invoice of demoInvoices) {
    const created = await prisma.invoice.create({
      data: {
        companyId: company.id,
        customerId: customerMap.get(invoice.customerId)!,
        quoteId: invoice.quoteId ? quoteMap.get(invoice.quoteId) : null,
        number: invoice.number,
        type: invoice.type,
        status: invoice.status,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        remainingAmount: invoice.remainingAmount,
        complianceStatus: invoice.complianceStatus,
        transmissionStatus: invoice.transmissionStatus,
        pdpStatus: invoice.pdpStatus,
        operationType: invoice.operationType,
        deliveryAddressNote: invoice.deliveryAddressNote,
        notes: invoice.notes,
        lines: {
          create: invoice.lines.map((line) => ({
            label: line.label,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            discount: line.discount,
            total: line.total
          }))
        }
      }
    });

    invoiceMap.set(invoice.id, created.id);
  }

  for (const payment of demoPayments) {
    await prisma.payment.create({
      data: {
        invoiceId: invoiceMap.get(payment.invoiceId)!,
        amount: payment.amount,
        method: payment.method,
        paidAt: new Date(payment.paidAt),
        reference: payment.reference
      }
    });
  }

  for (const reminder of demoReminders) {
    const createdReminder = await prisma.reminder.create({
      data: {
        invoiceId: invoiceMap.get(reminder.invoiceId)!,
        type: reminder.type,
        scheduledAt: new Date(reminder.scheduledAt),
        sentAt: reminder.sentAt ? new Date(reminder.sentAt) : null,
        status: reminder.status,
        subject: reminder.subject
      }
    });

    reminderMap.set(reminder.id, createdReminder.id);
  }

  for (const delivery of demoEmailDeliveries) {
    await prisma.emailDelivery.create({
      data: {
        companyId: company.id,
        invoiceId: delivery.invoiceId ? invoiceMap.get(delivery.invoiceId)! : null,
        reminderId: delivery.reminderId ? reminderMap.get(delivery.reminderId)! : null,
        kind: delivery.kind,
        status: delivery.status,
        provider: delivery.provider,
        recipientEmail: delivery.recipientEmail,
        recipientName: delivery.recipientName,
        subject: delivery.subject,
        externalId: delivery.externalId,
        errorMessage: delivery.errorMessage,
        sentAt: delivery.sentAt ? new Date(delivery.sentAt) : null
      }
    });
  }

  for (const creditNote of demoCreditNotes) {
    await prisma.creditNote.create({
      data: {
        companyId: company.id,
        invoiceId: invoiceMap.get(creditNote.invoiceId)!,
        number: creditNote.number,
        amount: creditNote.amount,
        reason: creditNote.reason
      }
    });
  }

  for (const connection of demoPdpConnections) {
    const createdConnection = await prisma.pdpConnection.create({
      data: {
        companyId: company.id,
        providerName: connection.providerName,
        status: connection.status,
        credentialsEncrypted: connection.credentialsEncrypted
      }
    });

    pdpConnectionMap.set(connection.id, createdConnection.id);
  }

  await prisma.complianceCheck.create({
    data: {
      companyId: company.id,
      score: demoComplianceCheck.score,
      status: demoComplianceCheck.status,
      missingFields: demoComplianceCheck.missingFields,
      warnings: demoComplianceCheck.warnings,
      checkedAt: new Date(demoComplianceCheck.checkedAt)
    }
  });

  for (const transmission of demoPdpTransmissions) {
    await prisma.pdpTransmission.create({
      data: {
        companyId: company.id,
        invoiceId: invoiceMap.get(transmission.invoiceId)!,
        pdpConnectionId: transmission.pdpConnectionId
          ? (pdpConnectionMap.get(transmission.pdpConnectionId) ?? null)
          : null,
        providerName: transmission.providerName,
        internalStatus: transmission.internalStatus,
        partnerStatus: transmission.partnerStatus,
        externalReference: transmission.externalReference,
        payloadSummary: transmission.payloadSummary,
        message: transmission.message,
        submittedAt: new Date(transmission.submittedAt)
      }
    });
  }

  for (const log of demoComplianceAuditLogs) {
    await prisma.complianceAuditLog.create({
      data: {
        companyId: company.id,
        invoiceId: log.invoiceId ? invoiceMap.get(log.invoiceId)! : null,
        category: log.category,
        level: log.level,
        title: log.title,
        detail: log.detail,
        createdAt: new Date(log.createdAt)
      }
    });
  }

  for (const event of demoBillingEvents) {
    await prisma.billingEvent.create({
      data: {
        companyId: company.id,
        stripeEventId: event.stripeEventId,
        type: event.type,
        state: event.state,
        summary: event.summary,
        payload: {
          source: "seed",
          type: event.type
        },
        receivedAt: new Date(event.receivedAt),
        processedAt: event.processedAt ? new Date(event.processedAt) : null
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
