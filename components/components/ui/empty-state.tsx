import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-white/55">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
