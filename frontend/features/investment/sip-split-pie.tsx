"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useLanguage } from "@/components/providers/language-provider";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { SipSummary } from "@/types/investment";

const COLORS = {
  invested: "#059669",
  returns: "#3b82f6",
};

type SipSplitPieProps = {
  summary: SipSummary;
  /** Compact layout for the results card */
  compact?: boolean;
};

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground shadow-lg">
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function SipSplitPie({ summary, compact = false }: SipSplitPieProps) {
  const { t } = useLanguage();

  const splitData = useMemo(
    () => [
      { name: t.chartInvested, value: Number(summary.total_invested), color: COLORS.invested },
      { name: t.chartReturns, value: Number(summary.estimated_returns), color: COLORS.returns },
    ],
    [summary, t],
  );

  const chartHeight = compact ? 168 : 280;
  const innerRadius = compact ? 44 : 60;
  const outerRadius = compact ? 68 : 100;

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{t.chartSipSplit}</p>
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={splitData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="none"
            >
              {splitData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <PieTooltip
                  active={active}
                  payload={payload?.map((p) => ({
                    name: String(p.name),
                    value: Number(p.value),
                    color: String(p.payload.color),
                  }))}
                />
              )}
            />
            {!compact && (
              <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-emerald-500/10 px-2 py-1.5">
          <p className="text-muted-foreground">{t.chartInvested}</p>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatINRCompact(Number(summary.total_invested))}
          </p>
        </div>
        <div className="rounded-lg bg-blue-500/10 px-2 py-1.5">
          <p className="text-muted-foreground">{t.chartReturns}</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {formatINRCompact(Number(summary.estimated_returns))}
          </p>
        </div>
      </div>
    </div>
  );
}
