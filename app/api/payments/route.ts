import { NextResponse } from "next/server";

import { listPayments } from "@/lib/services/payment-service";

export async function GET() {
  return NextResponse.json(listPayments());
}
