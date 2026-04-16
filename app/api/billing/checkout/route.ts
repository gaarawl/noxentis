import { NextResponse } from "next/server";

import { billingPlanSchema } from "@/lib/domain/validators";
import { startBillingCheckout } from "@/lib/services/billing-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = {
    plan: formData.get("plan")
  };

  const parsed = billingPlanSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/billing?checkout=error", request.url), 303);
  }

  try {
    const result = await startBillingCheckout(parsed.data.plan);
    return NextResponse.redirect(result.url, 303);
  } catch {
    return NextResponse.redirect(new URL("/billing?checkout=error", request.url), 303);
  }
}
