import type { BillingStatus as PrismaBillingStatus, BillingSubscription as PrismaBillingSubscription } from "@prisma/client";

import { billingPlanCatalog, billingPlans, getPlanFromPriceId, getPlanPriceId, TRIAL_LENGTH_DAYS } from "@/lib/config/billing";
import { demoSession } from "@/lib/data/demo-data";
import { formatCurrency, formatDate } from "@/lib/domain/calculations";
import type { BillingOverview, BillingStatus, BillingSubscription, PlanTier } from "@/lib/domain/models";
import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import { requireCurrentSession } from "@/lib/services/auth-service";
import { getStripeClient } from "@/lib/stripe";

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getTrialDaysRemaining(trialEndsAt?: string | Date | null) {
  if (!trialEndsAt) {
    return 0;
  }

  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getBillingMode() {
  const stripe = getStripeClient();
  const catalogReady = (["SOLO", "PRO", "BUSINESS"] as const).every((plan) => Boolean(getPlanPriceId(plan)));
  return stripe && catalogReady ? "stripe" : "preview";
}

function mapStatusLabel(status: BillingStatus) {
  if (status === "TRIALING") {
    return "Essai actif";
  }

  if (status === "ACTIVE") {
    return "Actif";
  }

  if (status === "PAST_DUE") {
    return "Action requise";
  }

  if (status === "INCOMPLETE") {
    return "En attente";
  }

  return "Annule";
}

function mapStripeStatus(status: PrismaBillingStatus | string): BillingStatus {
  if (status === "trialing" || status === "TRIALING") {
    return "TRIALING";
  }

  if (status === "active" || status === "ACTIVE") {
    return "ACTIVE";
  }

  if (status === "past_due" || status === "unpaid" || status === "paused" || status === "PAST_DUE") {
    return "PAST_DUE";
  }

  if (status === "incomplete" || status === "incomplete_expired" || status === "INCOMPLETE") {
    return "INCOMPLETE";
  }

  return "CANCELED";
}

function toDomainSubscription(record: PrismaBillingSubscription): BillingSubscription {
  return {
    id: record.id,
    companyId: record.companyId,
    plan: record.plan,
    status: record.status,
    stripeCustomerId: record.stripeCustomerId || undefined,
    stripeSubscriptionId: record.stripeSubscriptionId || undefined,
    stripePriceId: record.stripePriceId || undefined,
    stripeCheckoutSessionId: record.stripeCheckoutSessionId || undefined,
    trialEndsAt: record.trialEndsAt?.toISOString(),
    currentPeriodEnd: record.currentPeriodEnd?.toISOString(),
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    seats: record.seats,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function buildOverview(
  subscription: BillingSubscription,
  mode: "preview" | "stripe"
): BillingOverview {
  const catalogEntry = billingPlanCatalog[subscription.plan];
  const trialDaysRemaining = getTrialDaysRemaining(subscription.trialEndsAt);

  return {
    mode,
    subscription,
    pricingPlans: billingPlans,
    activePlan: subscription.plan,
    statusLabel: mapStatusLabel(subscription.status),
    nextInvoiceAmount: formatCurrency(catalogEntry.monthlyAmountCents / 100),
    trialEndsAtLabel:
      subscription.trialEndsAt && trialDaysRemaining > 0
        ? formatDate(subscription.trialEndsAt)
        : "Aucun essai en cours",
    currentPeriodEndLabel: subscription.currentPeriodEnd
      ? formatDate(subscription.currentPeriodEnd)
      : "A definir",
    seatsLabel: `${subscription.seats} utilisateur${subscription.seats > 1 ? "s" : ""} inclus`,
    trialDaysRemaining,
    canManagePortal: mode === "stripe" && Boolean(subscription.stripeCustomerId),
    supportModeLabel: mode === "stripe" ? "Stripe actif" : "Mode preview"
  };
}

async function ensureBillingSubscription(companyId: string) {
  const prisma = getPrisma();
  const existing = await prisma.billingSubscription.findUnique({
    where: { companyId }
  });

  if (existing) {
    return existing;
  }

  const trialEndsAt = addDays(new Date(), TRIAL_LENGTH_DAYS);
  return prisma.billingSubscription.create({
    data: {
      companyId,
      plan: "PRO",
      status: "TRIALING",
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
      seats: billingPlanCatalog.PRO.includedSeats
    }
  });
}

async function syncStripeSubscription(companyId: string) {
  const mode = getBillingMode();
  const prisma = getPrisma();
  const current = await ensureBillingSubscription(companyId);

  if (mode !== "stripe" || !current.stripeSubscriptionId) {
    return current;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return current;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(current.stripeSubscriptionId);
    const priceId = subscription.items.data[0]?.price?.id || null;
    const plan = getPlanFromPriceId(priceId) || current.plan;

    return prisma.billingSubscription.update({
      where: { companyId },
      data: {
        plan,
        status: mapStripeStatus(subscription.status),
        stripePriceId: priceId,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        seats: billingPlanCatalog[plan].includedSeats
      }
    });
  } catch {
    return current;
  }
}

async function syncCheckoutSession(companyId: string, sessionId: string) {
  const mode = getBillingMode();
  if (mode !== "stripe") {
    return ensureBillingSubscription(companyId);
  }

  const stripe = getStripeClient();
  const prisma = getPrisma();
  if (!stripe) {
    return ensureBillingSubscription(companyId);
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"]
    });

    if (checkoutSession.mode !== "subscription" || !checkoutSession.subscription) {
      return ensureBillingSubscription(companyId);
    }

    const subscription =
      typeof checkoutSession.subscription === "string"
        ? await stripe.subscriptions.retrieve(checkoutSession.subscription)
        : checkoutSession.subscription;
    const priceId = subscription.items.data[0]?.price?.id || null;
    const plan =
      getPlanFromPriceId(priceId) ||
      ((checkoutSession.metadata?.plan as PlanTier | undefined) ?? "PRO");
    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id || null;

    return prisma.billingSubscription.upsert({
      where: { companyId },
      update: {
        plan,
        status: mapStripeStatus(subscription.status),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCheckoutSessionId: checkoutSession.id,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        seats: billingPlanCatalog[plan].includedSeats
      },
      create: {
        companyId,
        plan,
        status: mapStripeStatus(subscription.status),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCheckoutSessionId: checkoutSession.id,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        seats: billingPlanCatalog[plan].includedSeats
      }
    });
  } catch {
    return ensureBillingSubscription(companyId);
  }
}

async function updatePreviewPlan(companyId: string, plan: PlanTier) {
  const prisma = getPrisma();
  const current = await ensureBillingSubscription(companyId);

  return prisma.billingSubscription.update({
    where: { companyId },
    data: {
      plan,
      status: current.status === "CANCELED" ? "ACTIVE" : current.status,
      currentPeriodEnd: current.currentPeriodEnd || current.trialEndsAt || addDays(new Date(), 30),
      seats: billingPlanCatalog[plan].includedSeats
    }
  });
}

export async function getBillingOverview(options?: { checkoutSessionId?: string }) {
  if (!isLiveMode()) {
    const trialEndsAt = addDays(new Date(), TRIAL_LENGTH_DAYS).toISOString();
    return buildOverview(
      {
        id: "billing_demo",
        companyId: demoSession.companyId,
        plan: "PRO",
        status: "TRIALING",
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
        cancelAtPeriodEnd: false,
        seats: billingPlanCatalog.PRO.includedSeats,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      "preview"
    );
  }

  const session = await requireCurrentSession();
  const subscriptionRecord = options?.checkoutSessionId
    ? await syncCheckoutSession(session.companyId, options.checkoutSessionId)
    : await syncStripeSubscription(session.companyId);

  return buildOverview(toDomainSubscription(subscriptionRecord), getBillingMode());
}

export async function startBillingCheckout(plan: PlanTier) {
  const session = await requireCurrentSession();
  const prisma = getPrisma();
  const subscription = await ensureBillingSubscription(session.companyId);
  const appUrl = getAppUrl();
  const mode = getBillingMode();

  if (mode !== "stripe") {
    await updatePreviewPlan(session.companyId, plan);
    return {
      url: `${appUrl}/billing?checkout=preview&plan=${plan}`
    };
  }

  const stripe = getStripeClient();
  const priceId = getPlanPriceId(plan);

  if (!stripe || !priceId) {
    await updatePreviewPlan(session.companyId, plan);
    return {
      url: `${appUrl}/billing?checkout=preview&plan=${plan}`
    };
  }

  let stripeCustomerId = subscription.stripeCustomerId || null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      name: `${session.firstName} ${session.lastName}`.trim(),
      metadata: {
        companyId: session.companyId,
        companyName: session.companyName
      }
    });

    stripeCustomerId = customer.id;
    await prisma.billingSubscription.update({
      where: { companyId: session.companyId },
      data: {
        stripeCustomerId
      }
    });
  }

  const trialDaysRemaining =
    subscription.stripeSubscriptionId || subscription.status !== "TRIALING"
      ? 0
      : getTrialDaysRemaining(subscription.trialEndsAt);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?checkout=cancelled`,
    metadata: {
      companyId: session.companyId,
      plan
    },
    subscription_data: {
      metadata: {
        companyId: session.companyId,
        plan
      },
      ...(trialDaysRemaining > 0 ? { trial_period_days: trialDaysRemaining } : {})
    }
  });

  await prisma.billingSubscription.update({
    where: { companyId: session.companyId },
    data: {
      plan,
      stripeCustomerId,
      stripePriceId: priceId,
      stripeCheckoutSessionId: checkoutSession.id,
      seats: billingPlanCatalog[plan].includedSeats
    }
  });

  return {
    url: checkoutSession.url || `${appUrl}/billing?checkout=success`
  };
}

export async function openBillingPortal() {
  const session = await requireCurrentSession();
  const appUrl = getAppUrl();
  const subscription = await ensureBillingSubscription(session.companyId);

  if (getBillingMode() !== "stripe" || !subscription.stripeCustomerId) {
    return {
      url: `${appUrl}/billing?portal=preview`
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return {
      url: `${appUrl}/billing?portal=preview`
    };
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/billing?portal=return`
    });

    return {
      url: portalSession.url
    };
  } catch {
    return {
      url: `${appUrl}/billing?portal=preview`
    };
  }
}
