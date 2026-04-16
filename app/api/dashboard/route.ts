import { NextResponse } from "next/server";

import { getDashboardSnapshot } from "@/lib/services/dashboard-service";

export async function GET() {
  return NextResponse.json(await getDashboardSnapshot());
}
