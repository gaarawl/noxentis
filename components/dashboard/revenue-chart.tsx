"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCurrency } from "@/lib/domain/calculations";
import type { ChartPoint } from "@/lib/domain/models";

const labels: Record<string, string> = {
  revenue: "CA facture",
  cashIn: "Encaissements"
};

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  const hasData = data.some((point) => point.revenue > 0 || point.cashIn > 0 || point.overdue > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-white/45">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          CA facture
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          Encaissements
        </div>
      </div>

      <div className="relative h-[320px] w-full">
        {!hasData ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-3xl border border-white/8 bg-black/55 px-5 py-4 text-center backdrop-blur-xl">
              <p className="text-sm font-medium text-white">Aucune activité encore enregistrée</p>
              <p className="mt-1 text-xs text-white/50">
                Le graphique se remplira dès vos premières factures et vos premiers paiements.
              </p>
            </div>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dfe6f0" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#dfe6f0" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="cashGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => (value === 0 ? "0 €" : `${Math.round(value / 1000)}k`)}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(9, 10, 12, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                color: "#fff"
              }}
              labelFormatter={(label) => `Mois : ${label}`}
              formatter={(value: number, name: string) => [formatCurrency(value), labels[name] || name]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f5f7fb"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
            <Area
              type="monotone"
              dataKey="cashIn"
              stroke="#6ee7b7"
              strokeWidth={2}
              fill="url(#cashGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
