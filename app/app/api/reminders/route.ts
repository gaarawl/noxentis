import { NextResponse } from "next/server";

import { listReminders } from "@/lib/services/payment-service";

export async function GET() {
  return NextResponse.json(await listReminders());
}
