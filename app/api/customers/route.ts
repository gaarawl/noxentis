import { NextResponse } from "next/server";

import { listCustomers } from "@/lib/services/customer-service";
import { createCustomerRecord } from "@/lib/services/mutation-service";

export async function GET() {
  return NextResponse.json(await listCustomers());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await createCustomerRecord(payload);

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
