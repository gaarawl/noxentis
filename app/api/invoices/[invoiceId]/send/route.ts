import { NextResponse } from "next/server";

import { sendInvoiceEmail } from "@/lib/services/email-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await context.params;
  const result = await sendInvoiceEmail(invoiceId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
