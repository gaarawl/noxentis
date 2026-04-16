import { NextResponse } from "next/server";

import { importCustomerRecords } from "@/lib/services/mutation-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await importCustomerRecords(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
