import { NextResponse } from "next/server";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { PdfDocument } from "@/components/documents/pdf-document";
import { getExportDocument } from "@/lib/services/document-export-service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; documentId: string }> }
) {
  const { kind, documentId } = await context.params;
  if (kind !== "quote" && kind !== "invoice") {
    return NextResponse.json({ ok: false, message: "Document non supporte." }, { status: 404 });
  }

  const exportDocument = await getExportDocument(kind, documentId);
  if (!exportDocument) {
    return NextResponse.json({ ok: false, message: "Document introuvable." }, { status: 404 });
  }

  const pdfElement = createElement(PdfDocument, {
    kind: exportDocument.kind,
    company: exportDocument.company,
    customer: exportDocument.customer,
    document: exportDocument.document
  }) as Parameters<typeof renderToBuffer>[0];

  const buffer = await renderToBuffer(pdfElement);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=\"${exportDocument.document.number}.pdf\"`
    }
  });
}
