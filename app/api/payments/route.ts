import { NextResponse } from "next/server";

import { recordInvoicePayment } from "@/lib/services/mutation-service";
import { listPayments } from "@/lib/services/payment-service";

export async function GET() {
  return NextResponse.json(await listPayments());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await recordInvoicePayment(payload);

  return NextResponse.json(result, {
    status: result.ok ? 201 : 400
  });
}
