import { NextResponse } from "next/server";

import { listInvoices } from "@/lib/services/document-service";
import { createInvoiceRecord } from "@/lib/services/mutation-service";

export async function GET() {
  return NextResponse.json(await listInvoices());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await createInvoiceRecord(payload);

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
