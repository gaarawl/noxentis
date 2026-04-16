import Stripe from "stripe";

declare global {
  var __noxentisStripe__: Stripe | undefined;
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!globalThis.__noxentisStripe__) {
    globalThis.__noxentisStripe__ = new Stripe(secretKey);
  }

  return globalThis.__noxentisStripe__;
}

