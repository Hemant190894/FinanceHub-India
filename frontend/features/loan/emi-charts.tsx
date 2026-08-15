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
import type { AmortizationResponse, EmiResponse } from "@/types/loan";

const COLORS = {
  principal: "#059669",
  interest: "#f59e0b",
};

type EmiChartsProps = {
  summary: EmiResponse;
  schedule: AmortizationResponse["schedule"];
  principalAmount: number;
};

type YearlyRow = {
  year: number;
  yearLabel: string;
  yearShort: string;
  principal: number;
  interest: number;
};

function aggregateYearly(
  schedule: AmortizationResponse["schedule"],
  yearLabel: (year: number) => string,
): YearlyRow[] {
  const byYear = new Map<number, Omit<YearlyRow, "yearLabel" | "yearShort">>();

  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    const current = byYear.get(year) ?? { year, principal: 0, interest: 0 };
    current.principal += Number(row.principal);
    current.interest += Number(row.interest);
    byYear.set(year, current);
  }

  return Array.from(byYear.values())
    .sort((a, b) => a.year - b.year)
    .map((row) => ({
      ...row,
      yearLabel: yearLabel(row.year),
      yearShort: String(row.year),
    }));
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {formatINR(item.value)}
        </p>
      ))}
    </div>
  );
}

function RotatedXAxis({
  axisColor,
  dataKey = "yearShort",
}: {
  axisColor: string;
  dataKey?: string;
}) {
  return (
    <XAxis
      dataKey={dataKey}
      interval={0}
      angle={-45}
      textAnchor="end"
      height={70}
      tick={{ fill: axisColor, fontSize: 10 }}
      tickLine={false}
      axisLine={false}
    />
  );
}

export function EmiCharts({ summary, schedule, principalAmount }: EmiChartsProps) {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { gridColor, axisColor } = getChartTheme(resolvedTheme === "dark");

  const pieData = useMemo(
    () => [
      { name: t.chartPrincipal, value: principalAmount, color: COLORS.principal },
      { name: t.chartInterest, value: Number(summary.total_interest), color: COLORS.interest },
    ],
    [principalAmount, summary.total_interest, t.chartPrincipal, t.chartInterest],
  );

  const yearlyData = useMemo(() => aggregateYearly(schedule, t.chartYear), [schedule, t.chartYear]);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">{t.chartsTitle}</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">{t.chartPaymentSplit}</CardTitle>
            <CardDescription>{t.chartPaymentSplitDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full drop-shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="principalGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="interestGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="url(#principalGrad)" />
                    <Cell fill="url(#interestGrad)" />
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
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <p className="text-muted-foreground">{t.chartPrincipal}</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatINRCompact(principalAmount)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2">
                <p className="text-muted-foreground">{t.chartInterest}</p>
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatINRCompact(Number(summary.total_interest))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line — principal + interest per year */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">{t.chartBalanceTitle}</CardTitle>
            <CardDescription>{t.chartBalanceDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yearlyData}
                  margin={{ top: 8, right: 12, left: 0, bottom: CHART_BOTTOM_MARGIN }}
                >
                  <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
                  <RotatedXAxis axisColor={axisColor} />
                  <YAxis
                    tickFormatter={formatINRCompact}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                  />
                  <Tooltip
                    content={({ active, payload }) => (
                      <ChartTooltip
                        active={active}
                        label={payload?.[0]?.payload?.yearLabel as string}
                        payload={payload?.map((p) => ({
                          name: String(p.name),
                          value: Number(p.value),
                          color: p.dataKey === "principal" ? COLORS.principal : COLORS.interest,
                        }))}
                      />
                    )}
                  />
                  <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                  <Line
                    type="monotone"
                    dataKey="principal"
                    name={t.chartPrincipal}
                    stroke={COLORS.principal}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interest"
                    name={t.chartInterest}
                    stroke={COLORS.interest}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked bar — yearly principal vs interest */}
      <Card className="border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{t.chartYearlyTitle}</CardTitle>
          <CardDescription>{t.chartYearlyDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                margin={{ top: 8, right: 12, left: 0, bottom: CHART_BOTTOM_MARGIN }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
                <RotatedXAxis axisColor={axisColor} />
                <YAxis
                  tickFormatter={formatINRCompact}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltip
                      active={active}
                      label={payload?.[0]?.payload?.yearLabel as string}
                      payload={payload?.map((p) => ({
                        name: String(p.name),
                        value: Number(p.value),
                        color: p.dataKey === "principal" ? COLORS.principal : COLORS.interest,
                      }))}
                    />
                  )}
                />
                <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                <Bar dataKey="principal" name={t.chartPrincipal} stackId="emi" fill={COLORS.principal} />
                <Bar
                  dataKey="interest"
                  name={t.chartInterest}
                  stackId="emi"
                  fill={COLORS.interest}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
