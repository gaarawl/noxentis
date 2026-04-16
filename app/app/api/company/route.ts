import { NextResponse } from "next/server";

import { getCompanyProfile } from "@/lib/services/company-service";
import { saveCompanyProfile } from "@/lib/services/mutation-service";

export async function GET() {
  return NextResponse.json(await getCompanyProfile());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await saveCompanyProfile(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
