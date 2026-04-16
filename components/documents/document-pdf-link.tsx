import type { ExportDocumentKind } from "@/lib/services/document-export-service";

export function DocumentPdfLink({
  kind,
  documentId,
  label = "PDF"
}: {
  kind: ExportDocumentKind;
  documentId: string;
  label?: string;
}) {
  return (
    <a
      href={`/api/documents/${kind}/${documentId}/pdf`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-white/75 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
    >
      {label}
    </a>
  );
}
