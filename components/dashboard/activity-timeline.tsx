import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/domain/calculations";
import type { ActivityItem } from "@/lib/domain/models";

const categoryVariant = {
  invoice: "default",
  quote: "outline",
  payment: "success",
  compliance: "warning",
  reminder: "danger"
} as const;

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Aucune activité récente"
        description="Vos devis, factures, paiements et relances apparaîtront ici dès les premiers mouvements du compte."
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/[0.03] p-4"
        >
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white/60" />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-medium text-white">{item.title}</p>
              <Badge variant={categoryVariant[item.category]}>{item.category}</Badge>
            </div>
            <p className="text-sm text-white/55">{item.description}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            {formatDate(item.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
}
