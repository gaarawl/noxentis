import { NextResponse } from "next/server";

import { requestReset } from "@/lib/services/auth-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await requestReset(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
