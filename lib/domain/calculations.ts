import { format } from "date-fns";

import type { DocumentLine } from "@/lib/domain/models";

export function calculateLineTotal(line: Omit<DocumentLine, "total"> | DocumentLine) {
  const raw = line.quantity * line.unitPrice;
  const discount = raw * ((line.discount || 0) / 100);
  return Number((raw - discount).toFixed(2));
}

export function calculateDocumentTotals(lines: Array<Omit<DocumentLine, "total"> | DocumentLine>) {
  const subtotal = Number(
    lines.reduce((sum, line) => sum + calculateLineTotal(line), 0).toFixed(2)
  );
  const taxAmount = Number(
    lines
      .reduce((sum, line) => sum + calculateLineTotal(line) * (line.taxRate / 100), 0)
      .toFixed(2)
  );

  return {
    subtotal,
    taxAmount,
    total: Number((subtotal + taxAmount).toFixed(2))
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(0)} %`;
}

export function formatDate(value: string) {
  return format(new Date(value), "dd/MM/yyyy");
}
