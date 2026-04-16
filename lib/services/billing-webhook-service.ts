import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";

import { billingPlanCatalog, getPlanFromPriceId } from "@/lib/config/billing";
import type { PlanTier } from "@/lib/domain/models";
import { getPrisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

function mapStripeStatus(status: string) {
  if (status === "trialing" || status === "trial_will_end") {
    return "TRIALING" as const;
  }

  if (status === "active") {
    return "ACTIVE" as const;
  }

  if (status === "past_due" || status === "unpaid" || status === "paused") {
    return "PAST_DUE" as const;
  }

  if (status === "incomplete" || status === "incomplete_expired") {
    return "INCOMPLETE" as const;
  }

  return "CANCELED" as const;
}

function readMetadataCompanyId(object: { metadata?: Record<string, string> | null }) {
  return object.metadata?.companyId || null;
}

async function resolveCompanyId(input: {
  metadataCompanyId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const prisma = getPrisma();

  if (input.metadataCompanyId) {
    return input.metadataCompanyId;
  }

  if (input.stripeSubscriptionId) {
    const subscription = await prisma.billingSubscription.findFirst({
      where: {
        stripeSubscriptionId: input.stripeSubscriptionId
      },
      select: {
        companyId: true
      }
    });

    if (subscription?.companyId) {
      return subscription.companyId;
    }
  }

  if (input.stripeCustomerId) {
    const subscription = await prisma.billingSubscription.findFirst({
      where: {
        stripeCustomerId: input.stripeCustomerId
      },
      select: {
        companyId: true
      }
    });

    if (subscription?.companyId) {
      return subscription.companyId;
    }
  }

  return null;
}

async function upsertBillingSubscriptionFromStripe(input: {
  companyId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeStatus: string;
  planHint?: PlanTier | null;
  trialEnd?: number | null;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean | null;
}) {
  const prisma = getPrisma();
  const existing = await prisma.billingSubscription.findUnique({
    where: { companyId: input.companyId }
  });
  const plan =
    getPlanFromPriceId(input.stripePriceId) || input.planHint || existing?.plan || "PRO";

  return prisma.billingSubscription.upsert({
    where: { companyId: input.companyId },
    update: {
      plan,
      status: mapStripeStatus(input.stripeStatus),
      stripeCustomerId: input.stripeCustomerId || existing?.stripeCustomerId || null,
      stripeSubscriptionId:
        input.stripeSubscriptionId || existing?.stripeSubscriptionId || null,
      stripePriceId: input.stripePriceId || existing?.stripePriceId || null,
      stripeCheckoutSessionId:
        input.stripeCheckoutSessionId || existing?.stripeCheckoutSessionId || null,
      trialEndsAt:
        typeof input.trialEnd === "number" ? new Date(input.trialEnd * 1000) : existing?.trialEndsAt,
      currentPeriodEnd:
        typeof input.currentPeriodEnd === "number"
          ? new Date(input.currentPeriodEnd * 1000)
          : existing?.currentPeriodEnd,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing?.cancelAtPeriodEnd ?? false,
      seats: billingPlanCatalog[plan].includedSeats
    },
    create: {
      companyId: input.companyId,
      plan,
      status: mapStripeStatus(input.stripeStatus),
      stripeCustomerId: input.stripeCustomerId || null,
      stripeSubscriptionId: input.stripeSubscriptionId || null,
      stripePriceId: input.stripePriceId || null,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId || null,
      trialEndsAt:
        typeof input.trialEnd === "number" ? new Date(input.trialEnd * 1000) : null,
      currentPeriodEnd:
        typeof input.currentPeriodEnd === "number"
          ? new Date(input.currentPeriodEnd * 1000)
          : null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      seats: billingPlanCatalog[plan].includedSeats
    }
  });
}

async function syncFromSubscriptionObject(
  companyId: string,
  subscription: Stripe.Subscription,
  extras?: {
    stripeCheckoutSessionId?: string | null;
    planHint?: PlanTier | null;
  }
) {
  const priceId = subscription.items.data[0]?.price?.id || null;

  return upsertBillingSubscriptionFromStripe({
    companyId,
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    stripeCheckoutSessionId: extras?.stripeCheckoutSessionId || null,
    stripeStatus: subscription.status,
    planHint: extras?.planHint || null,
    trialEnd: subscription.trial_end,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
}

async function retrieveSubscription(subscriptionId: string) {
  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

async function persistBillingEvent(params: {
  event: Stripe.Event;
  companyId?: string | null;
  state: "PROCESSED" | "IGNORED" | "FAILED";
  summary: string;
}) {
  const prisma = getPrisma();
  await prisma.billingEvent.upsert({
    where: {
      stripeEventId: params.event.id
    },
    update: {
      companyId: params.companyId || null,
      state: params.state,
      summary: params.summary,
      payload: params.event as unknown as Prisma.InputJsonValue,
      receivedAt: new Date(params.event.created * 1000),
      processedAt: new Date()
    },
    create: {
      companyId: params.companyId || null,
      stripeEventId: params.event.id,
      type: params.event.type,
      state: params.state,
      summary: params.summary,
      payload: params.event as unknown as Prisma.InputJsonValue,
      receivedAt: new Date(params.event.created * 1000),
      processedAt: new Date()
    }
  });
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  const prisma = getPrisma();
  const existing = await prisma.billingEvent.findUnique({
    where: {
      stripeEventId: event.id
    },
    select: {
      id: true
    }
  });

  if (existing) {
    return {
      duplicate: true as const,
      summary: "Evenement Stripe deja traite."
    };
  }

  let companyId: string | null = null;
  let summary = "Evenement Stripe journalise.";
  let state: "PROCESSED" | "IGNORED" | "FAILED" = "IGNORED";

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") {
          summary = "Checkout non abonnement ignore.";
          break;
        }

        companyId = await resolveCompanyId({
          metadataCompanyId: readMetadataCompanyId(session),
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id || null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null
        });

        if (!companyId) {
          summary = "Checkout Stripe recu sans correspondance entreprise.";
          break;
        }

        const planHint = (session.metadata?.plan as PlanTier | undefined) || null;
        const subscription =
          typeof session.subscription === "string"
            ? await retrieveSubscription(session.subscription)
            : null;

        if (subscription) {
          await syncFromSubscriptionObject(companyId, subscription, {
            stripeCheckoutSessionId: session.id,
            planHint
          });
        } else {
          await upsertBillingSubscriptionFromStripe({
            companyId,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : session.customer?.id || null,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : null,
            stripeCheckoutSessionId: session.id,
            stripeStatus: session.payment_status === "paid" ? "active" : "incomplete",
            planHint
          });
        }

        state = "PROCESSED";
        summary = "Checkout Stripe complete et abonnement synchronise.";
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        companyId = await resolveCompanyId({
          metadataCompanyId: readMetadataCompanyId(subscription),
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
          stripeSubscriptionId: subscription.id
        });

        if (!companyId) {
          summary = "Evenement abonnement Stripe recu sans entreprise rattachee.";
          break;
        }

        await syncFromSubscriptionObject(companyId, subscription, {
          planHint: (subscription.metadata?.plan as PlanTier | undefined) || null
        });

        state = "PROCESSED";
        summary = `Abonnement Stripe synchronise depuis ${event.type}.`;
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        companyId = await resolveCompanyId({
          metadataCompanyId: readMetadataCompanyId(invoice),
          stripeCustomerId:
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
          stripeSubscriptionId:
            typeof invoice.subscription === "string" ? invoice.subscription : null
        });

        if (!companyId) {
          summary = "Evenement facture Stripe recu sans abonnement rattache.";
          break;
        }

        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : null;
        const subscription = subscriptionId ? await retrieveSubscription(subscriptionId) : null;

        if (subscription) {
          await syncFromSubscriptionObject(companyId, subscription);
        } else {
          await upsertBillingSubscriptionFromStripe({
            companyId,
            stripeCustomerId:
              typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
            stripeSubscriptionId: subscriptionId,
            stripeStatus: event.type === "invoice.paid" ? "active" : "past_due"
          });
        }

        state = "PROCESSED";
        summary =
          event.type === "invoice.paid"
            ? "Paiement Stripe confirme et abonnement maintenu actif."
            : "Paiement Stripe en echec, abonnement passe en surveillance.";
        break;
      }

      default: {
        summary = `Evenement ${event.type} ignore pour l'instant.`;
        break;
      }
    }
  } catch (error) {
    state = "FAILED";
    summary = error instanceof Error ? error.message : "Erreur webhook Stripe.";
  }

  await persistBillingEvent({
    event,
    companyId,
    state,
    summary
  });

  return {
    duplicate: false as const,
    state,
    summary
  };
}
