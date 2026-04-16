import { NextResponse } from "next/server";

import { saveAccountProfile } from "@/lib/services/mutation-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await saveAccountProfile(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
