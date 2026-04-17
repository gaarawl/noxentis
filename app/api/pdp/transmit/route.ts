import { NextResponse } from "next/server";

import { simulateInvoiceTransmission } from "@/lib/services/pdp-mutation-service";

export async function POST(request: Request) {
  const payload = (await request.json()) as { invoiceId?: string };

  if (!payload.invoiceId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Facture manquante."
      },
      { status: 400 }
    );
  }

  const result = await simulateInvoiceTransmission(payload.invoiceId);
  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}

