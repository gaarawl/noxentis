import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpi } from "@/lib/domain/models";

export function KpiCard({ item }: { item: DashboardKpi }) {
  const variant =
    item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "default";
  const showTrendIcon =
    item.deltaMode === "trend" ||
    (!item.deltaMode && (item.delta.includes("%") || item.delta.startsWith("+") || item.delta.startsWith("-")));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">{item.label}</p>
          <Badge variant={variant}>
            {showTrendIcon ? <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> : null}
            {item.delta}
          </Badge>
        </div>
        <CardTitle className="text-3xl">{item.value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/50">{item.hint}</p>
      </CardContent>
    </Card>
  );
}
