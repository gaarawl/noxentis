import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureGrid({
  items
}: {
  items: Array<{ eyebrow: string; title: string; description: string }>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardContent className="space-y-4 p-6">
            <Badge variant="outline">{item.eyebrow}</Badge>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-7 text-white/60">{item.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
