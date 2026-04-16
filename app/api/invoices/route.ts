import { NextResponse } from "next/server";

import { listInvoices } from "@/lib/services/document-service";
import { invoiceEditorSchema } from "@/lib/domain/validators";

export async function GET() {
  return NextResponse.json(listInvoices());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = invoiceEditorSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Facture invalide." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data: parsed.data }, { status: 201 });
}
