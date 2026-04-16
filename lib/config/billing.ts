import type { PlanTier, PricingPlan } from "@/lib/domain/models";

type BillingPlanCatalogEntry = PricingPlan & {
  monthlyAmountCents: number;
  includedSeats: number;
  seatsLabel: string;
  stripeEnvKey: string;
};

export const TRIAL_LENGTH_DAYS = 14;

export const billingPlanCatalog: Record<PlanTier, BillingPlanCatalogEntry> = {
  SOLO: {
    name: "SOLO",
    priceMonthly: "29 EUR",
    monthlyAmountCents: 2900,
    includedSeats: 1,
    stripeEnvKey: "STRIPE_PRICE_SOLO_MONTHLY",
    seatsLabel: "1 utilisateur",
    description: "Pour freelances et independants qui veulent une image impeccable.",
    features: [
      "Devis, factures et avoirs premium",
      "Clients illimites",
      "Relances simples",
      "Checklist conformite"
    ]
  },
  PRO: {
    name: "PRO",
    priceMonthly: "79 EUR",
    monthlyAmountCents: 7900,
    includedSeats: 5,
    stripeEnvKey: "STRIPE_PRICE_PRO_MONTHLY",
    seatsLabel: "5 utilisateurs",
    highlight: true,
    description: "Pour agences, cabinets et TPE structurees.",
    features: [
      "Workflow devis vers facture",
      "Relances automatiques",
      "Dashboard tresorerie",
      "Connexion PDP partenaire"
    ]
  },
  BUSINESS: {
    name: "BUSINESS",
    priceMonthly: "149 EUR",
    monthlyAmountCents: 14900,
    includedSeats: 15,
    stripeEnvKey: "STRIPE_PRICE_BUSINESS_MONTHLY",
    seatsLabel: "Utilisateurs equipes",
    description: "Pour PME qui veulent pilotage, branding et coordination equipe.",
    features: [
      "Comptes equipe",
      "Branding avance",
      "Journal d'audit",
      "Accompagnement deploiement"
    ]
  }
};

export const billingPlans: PricingPlan[] = Object.values(billingPlanCatalog).map(
  ({ monthlyAmountCents: _amount, includedSeats: _includedSeats, seatsLabel: _seats, stripeEnvKey: _envKey, ...plan }) => plan
);

export function getPlanPriceId(plan: PlanTier) {
  const key = billingPlanCatalog[plan].stripeEnvKey;
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getPlanFromPriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) {
    return null;
  }

  const entry = Object.entries(billingPlanCatalog).find(
    ([plan]) => getPlanPriceId(plan as PlanTier) === priceId
  );

  return (entry?.[0] as PlanTier | undefined) || null;
}
