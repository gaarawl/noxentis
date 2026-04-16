import { NextResponse } from "next/server";

import { getPdpOverview } from "@/lib/services/pdp-service";

export async function GET() {
  return NextResponse.json(await getPdpOverview());
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Connexion partenaire simulée avec succès."
  });
}
