import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe";
import { processStripeWebhookEvent } from "@/lib/services/billing-webhook-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !endpointSecret) {
    return NextResponse.json(
      { ok: false, message: "Stripe webhook non configure." },
      { status: 400 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, message: "Signature Stripe absente." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    const result = await processStripeWebhookEvent(event);

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      state: "state" in result ? result.state : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook Stripe invalide.";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

