import { NextResponse } from "next/server";

import { openBillingPortal } from "@/lib/services/billing-service";

export async function POST(request: Request) {
  try {
    const result = await openBillingPortal();
    return NextResponse.redirect(result.url, 303);
  } catch {
    return NextResponse.redirect(new URL("/billing?portal=preview", request.url), 303);
  }
}
