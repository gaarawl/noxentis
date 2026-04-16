import { NextResponse } from "next/server";

import { createInvoiceReminder } from "@/lib/services/mutation-service";
import { listReminders } from "@/lib/services/reminder-service";

export async function GET() {
  return NextResponse.json(await listReminders());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await createInvoiceReminder(payload);

  return NextResponse.json(result, {
    status: result.ok ? 201 : 400
  });
}
