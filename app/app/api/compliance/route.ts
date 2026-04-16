import { NextResponse } from "next/server";

import { getComplianceOverview } from "@/lib/services/compliance-service";

export async function GET() {
  return NextResponse.json(await getComplianceOverview());
}
