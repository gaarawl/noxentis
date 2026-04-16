import { NextResponse } from "next/server";

import { listQuotes } from "@/lib/services/document-service";
import { createQuoteRecord } from "@/lib/services/mutation-service";

export async function GET() {
  return NextResponse.json(await listQuotes());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await createQuoteRecord(payload);

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
