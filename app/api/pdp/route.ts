import { NextResponse } from "next/server";

import {
  connectPdpProvider,
  disconnectPdpProvider
} from "@/lib/services/pdp-mutation-service";
import { getPdpOverview } from "@/lib/services/pdp-service";

export async function GET() {
  return NextResponse.json(await getPdpOverview());
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action?: "connect" | "disconnect";
    providerSlug?: string;
  };

  if (payload.action === "connect" && payload.providerSlug) {
    const result = await connectPdpProvider(payload.providerSlug);
    return NextResponse.json(result, {
      status: result.ok ? 200 : 400
    });
  }

  if (payload.action === "disconnect") {
    const result = await disconnectPdpProvider(payload.providerSlug);
    return NextResponse.json(result, {
      status: result.ok ? 200 : 400
    });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Action PDP invalide."
    },
    { status: 400 }
  );
}

