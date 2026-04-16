import { NextResponse } from "next/server";

import { logout } from "@/lib/services/auth-service";

export async function POST() {
  await logout();

  return NextResponse.json({ ok: true });
}
