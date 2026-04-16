import { NextResponse } from "next/server";

import { listQuotes } from "@/lib/services/document-service";
import { quoteEditorSchema } from "@/lib/domain/validators";

export async function GET() {
  return NextResponse.json(listQuotes());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = quoteEditorSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Devis invalide." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data: parsed.data }, { status: 201 });
}
