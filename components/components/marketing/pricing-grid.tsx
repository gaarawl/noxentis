import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingPlan } from "@/lib/domain/models";

export function PricingGrid({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={plan.highlight ? "border-white/14 bg-[linear-gradient(180deg,rgba(26,28,32,0.98),rgba(8,9,11,0.96))]" : undefined}
        >
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={plan.highlight ? "success" : "outline"}>
                {plan.highlight ? "Recommandé" : plan.name}
              </Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">{plan.name}</CardTitle>
              <p className="text-sm text-white/55">{plan.description}</p>
            </div>
            <p className="text-4xl font-semibold tracking-[-0.04em] text-white">
              {plan.priceMonthly}
              <span className="text-base font-normal text-white/40"> / mois</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-white/70">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" variant={plan.highlight ? "primary" : "secondary"}>
              Choisir {plan.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
