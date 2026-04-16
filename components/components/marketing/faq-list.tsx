import { Card, CardContent } from "@/components/ui/card";

export function FaqList({
  items
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.question}>
          <CardContent className="space-y-3 p-6">
            <h3 className="text-lg font-semibold text-white">{item.question}</h3>
            <p className="text-sm leading-7 text-white/58">{item.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
