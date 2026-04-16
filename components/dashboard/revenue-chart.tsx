"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/domain/calculations";
import type { ChartPoint } from "@/lib/domain/models";

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[320px] w-full">
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
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(9, 10, 12, 0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              color: "#fff"
            }}
            formatter={(value: number) => formatCurrency(value)}
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
  );
}
