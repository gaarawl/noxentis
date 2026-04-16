import { NextResponse } from "next/server";

import { listCustomers } from "@/lib/services/customer-service";
import { customerSchema } from "@/lib/domain/validators";

export async function GET() {
  return NextResponse.json(listCustomers());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = customerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Données client invalides." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data: parsed.data }, { status: 201 });
}
