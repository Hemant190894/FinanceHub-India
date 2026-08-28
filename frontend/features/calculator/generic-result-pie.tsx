"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useLanguage } from "@/components/providers/language-provider";
import { formatINR, formatINRCompact } from "@/lib/format";

export type GenericChartSegment = {
  name: string;
  value: number;
  color: string;
};

type GenericResultPieProps = {
  segments: GenericChartSegment[];
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

export function GenericResultPie({ segments, compact = false }: GenericResultPieProps) {
  const { t } = useLanguage();
  const data = segments.filter((s) => Number.isFinite(s.value) && s.value > 0);

  if (data.length < 2) return null;

  const chartHeight = compact ? 168 : 280;
  const innerRadius = compact ? 44 : 60;
  const outerRadius = compact ? 68 : 100;

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{t.chartResultSplit}</p>
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
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
        {data.map((entry) => (
          <div key={entry.name} className="rounded-lg px-2 py-1.5" style={{ backgroundColor: `${entry.color}1a` }}>
            <p className="text-muted-foreground">{entry.name}</p>
            <p className="font-semibold" style={{ color: entry.color }}>
              {formatINRCompact(entry.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
