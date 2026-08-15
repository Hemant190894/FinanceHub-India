"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_BOTTOM_MARGIN, getChartTheme } from "@/lib/chart-theme";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { SipProjection, SipSummary, SipYearlyRow } from "@/types/investment";

const COLORS = {
  invested: "#059669",
  returns: "#3b82f6",
  projection: "#8b5cf6",
};

type SipChartsProps = {
  summary: SipSummary;
  yearly: SipYearlyRow[];
  userTenureYears: number;
  projections: SipProjection[];
};

type GrowthRow = {
  year: number;
  yearLabel: string;
  yearShort: string;
  corpus: number | null;
  invested: number | null;
  projection: number | null;
  projectionYear?: number;
};

/** Actual years 1…N, then jump points only at future milestones (e.g. 5 → 10 → 15). */
function buildGrowthChartData(
  yearly: SipYearlyRow[],
  userTenureYears: number,
  projections: SipProjection[],
  yearLabel: (year: number) => string,
): GrowthRow[] {
  const yearlyByYear = new Map(yearly.map((row) => [row.year, row]));

  const rows: GrowthRow[] = Array.from({ length: userTenureYears }, (_, index) => {
    const year = index + 1;
    const actual = yearlyByYear.get(year);
    return {
      year,
      yearLabel: yearLabel(year),
      yearShort: String(year),
      corpus: actual ? Number(actual.corpus) : null,
      invested: actual ? Number(actual.invested) : null,
      projection: null,
    };
  });

  const lastRow = rows[rows.length - 1];
  if (lastRow?.corpus != null) {
    lastRow.projection = lastRow.corpus;
  }

  for (const projection of projections) {
    const endPoint = projection.yearly.find((row) => row.year === projection.tenureYears);
    rows.push({
      year: projection.tenureYears,
      yearLabel: yearLabel(projection.tenureYears),
      yearShort: String(projection.tenureYears),
      corpus: null,
      invested: null,
      projection: endPoint ? Number(endPoint.corpus) : null,
      projectionYear: projection.tenureYears,
    });
  }

  return rows.sort((a, b) => a.year - b.year);
}

function lineColor(dataKey: string): string {
  if (dataKey === "corpus") return COLORS.invested;
  if (dataKey === "invested") return COLORS.returns;
  if (dataKey === "projection") return COLORS.projection;
  return COLORS.invested;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const items = payload.filter((entry) => entry.value != null && !Number.isNaN(entry.value));
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground shadow-lg">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {items.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  );
}

function RotatedXAxis({ axisColor }: { axisColor: string }) {
  return (
    <XAxis
      dataKey="yearLabel"
      interval={0}
      angle={-45}
      textAnchor="end"
      height={70}
      tick={{ fill: axisColor, fontSize: 11 }}
      tickLine={false}
      axisLine={false}
    />
  );
}

export function SipCharts({ summary, yearly, userTenureYears, projections }: SipChartsProps) {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { gridColor, axisColor } = getChartTheme(resolvedTheme === "dark");

  const splitData = useMemo(
    () => [
      { name: t.chartInvested, value: Number(summary.total_invested), color: COLORS.invested },
      { name: t.chartReturns, value: Number(summary.estimated_returns), color: COLORS.returns },
    ],
    [summary, t],
  );

  const growthData = useMemo(
    () => buildGrowthChartData(yearly, userTenureYears, projections, t.chartYear),
    [yearly, userTenureYears, projections, t.chartYear],
  );

  const yearlyBarData = useMemo(
    () =>
      yearly.map((row) => ({
        year: String(row.year),
        yearLabel: t.chartYear(row.year),
        yearShort: String(row.year),
        invested: Number(row.invested),
        gains: Number(row.gains),
      })),
    [yearly, t],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">{t.chartsTitle}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.chartSipSplit}</CardTitle>
            <CardDescription>{t.chartSipSplitDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={splitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {splitData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload?.map((p) => ({
                          name: String(p.name),
                          value: Number(p.value),
                          color: String(p.payload.color),
                        }))}
                      />
                    )}
                  />
                  <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <p className="text-muted-foreground">{t.chartInvested}</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatINRCompact(Number(summary.total_invested))}
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <p className="text-muted-foreground">{t.chartReturns}</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatINRCompact(Number(summary.estimated_returns))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.chartCorpusGrowth}</CardTitle>
            <CardDescription>{t.chartCorpusGrowthDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 8, right: 12, left: 4, bottom: CHART_BOTTOM_MARGIN }}
                >
                  <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
                  <RotatedXAxis axisColor={axisColor} />
                  <YAxis
                    tickFormatter={formatINRCompact}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      const point = payload?.[0]?.payload as GrowthRow | undefined;
                      return (
                        <ChartTooltip
                          active={active}
                          label={point?.yearLabel}
                          payload={payload
                            ?.filter((p) => p.value != null)
                            .map((p) => {
                              const dataKey = String(p.dataKey);
                              const isMilestoneProjection =
                                dataKey === "projection" && point?.projectionYear != null;
                              return {
                                name: isMilestoneProjection
                                  ? t.chartProjection(point.projectionYear!)
                                  : String(p.name),
                                value: Number(p.value),
                                color: lineColor(dataKey),
                              };
                            })}
                        />
                      );
                    }}
                  />
                  <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                  <Line
                    type="linear"
                    dataKey="corpus"
                    name={t.maturityValue}
                    stroke={COLORS.invested}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Line
                    type="linear"
                    dataKey="invested"
                    name={t.chartInvested}
                    stroke={COLORS.returns}
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  {projections.length > 0 && (
                    <Line
                      type="linear"
                      dataKey="projection"
                      name={t.chartProjectionLine}
                      stroke={COLORS.projection}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={{ r: 5, strokeWidth: 0, fill: COLORS.projection }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.chartYearlySip}</CardTitle>
          <CardDescription>{t.chartYearlySipDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyBarData}
                margin={{ top: 8, right: 12, left: 4, bottom: CHART_BOTTOM_MARGIN }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
                <RotatedXAxis axisColor={axisColor} />
                <YAxis
                  tickFormatter={formatINRCompact}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => (
                    <ChartTooltip
                      active={active}
                      label={payload?.[0]?.payload?.yearLabel as string}
                      payload={payload?.map((p) => ({
                        name: String(p.name),
                        value: Number(p.value),
                        color: p.dataKey === "invested" ? COLORS.invested : COLORS.returns,
                      }))}
                    />
                  )}
                />
                <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                <Bar
                  dataKey="invested"
                  name={t.chartInvested}
                  stackId="sip"
                  fill={COLORS.invested}
                  activeBar={false}
                />
                <Bar
                  dataKey="gains"
                  name={t.chartReturns}
                  stackId="sip"
                  fill={COLORS.returns}
                  radius={[4, 4, 0, 0]}
                  activeBar={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
