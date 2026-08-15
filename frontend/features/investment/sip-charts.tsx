"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_BOTTOM_MARGIN, getChartTheme } from "@/lib/chart-theme";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { SipProjection, SipYearlyRow } from "@/types/investment";

type SipChartsProps = {
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

function lineColor(dataKey: string, theme: ReturnType<typeof getChartTheme>): string {
  if (dataKey === "corpus") return theme.principal;
  if (dataKey === "invested") return theme.blue;
  if (dataKey === "projection") return theme.violet;
  return theme.principal;
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

export function SipCharts({ yearly, userTenureYears, projections }: SipChartsProps) {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const theme = getChartTheme(resolvedTheme === "dark");
  const { gridColor, axisColor } = theme;

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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.chartCorpusGrowth}</CardTitle>
          <CardDescription>{t.chartCorpusGrowthDesc}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 12, right: 16, left: 8, bottom: CHART_BOTTOM_MARGIN }}
                >
                  <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
                  <RotatedXAxis axisColor={axisColor} />
                  <YAxis
                    tickFormatter={formatINRCompact}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={58}
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
                                color: lineColor(dataKey, theme),
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
                    stroke={theme.principal}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Line
                    type="linear"
                    dataKey="invested"
                    name={t.chartInvested}
                    stroke={theme.blue}
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
                      stroke={theme.violet}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={{ r: 5, strokeWidth: 0, fill: theme.violet }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
                        color: p.dataKey === "invested" ? theme.principal : theme.blue,
                      }))}
                    />
                  )}
                />
                <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                <Bar
                  dataKey="invested"
                  name={t.chartInvested}
                  stackId="sip"
                  fill={theme.principal}
                  activeBar={false}
                />
                <Bar
                  dataKey="gains"
                  name={t.chartReturns}
                  stackId="sip"
                  fill={theme.blue}
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
