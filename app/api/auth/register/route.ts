import { NextResponse } from "next/server";

import { registerAccount } from "@/lib/services/auth-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await registerAccount(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
