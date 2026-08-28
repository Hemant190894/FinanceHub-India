"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { NumberSliderField } from "@/components/number-slider-field";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GenericResultPie } from "@/features/calculator/generic-result-pie";
import { useCountUp } from "@/hooks/use-count-up";
import { apiPost } from "@/lib/api";
import { getChartTheme } from "@/lib/chart-theme";
import { CALCULATOR_BY_SLUG } from "@/lib/calculators/registry";
import { isSelectField } from "@/lib/calculators/registry";
import type { TranslationKeys } from "@/lib/i18n/types";
import { formatINRDetailed, parseINRInput } from "@/lib/format";

type LabelKey = keyof TranslationKeys;

type CalcResponse = { summary: Record<string, string> };

type GenericCalculatorProps = {
  slug: string;
};

function parseFieldValue(
  field: import("@/lib/calculators/registry").CalculatorRegistryEntry["fields"][number],
  raw: string,
): number | string {
  if (isSelectField(field)) return raw;
  if (field.parse === "inr") return parseINRInput(raw);
  return Number(raw);
}

export function GenericCalculator({ slug }: GenericCalculatorProps) {
  const config = CALCULATOR_BY_SLUG[slug];
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((config?.fields ?? []).map((f) => [f.id, f.defaultValue])),
  );
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => {
    const out: Record<string, string | number> = {};
    for (const field of config?.fields ?? []) {
      out[field.id] = parseFieldValue(field, values[field.id] ?? field.defaultValue);
    }
    return out;
  }, [config?.fields, values]);

  const canCalculate = useMemo(() => {
    for (const field of config?.fields ?? []) {
      if (isSelectField(field)) continue;
      const val = parsed[field.id];
      if (typeof val !== "number" || !Number.isFinite(val)) return false;
      if (field.parse === "inr" && val <= 0) return false;
      if ((field.id === "tenure_years" || field.id === "tenure_months") && val <= 0) return false;
    }
    return true;
  }, [config?.fields, parsed]);

  async function calculate() {
    if (!canCalculate) return;
    setLoading(true);
    setError(null);
    try {
      const payload = config.buildPayload(parsed);
      const data = await apiPost<CalcResponse>(config.endpoint, payload);
      setResult(data);
    } catch {
      setResult(null);
      setError(t.calcError);
    } finally {
      setLoading(false);
    }
  }

  function formatResult(value: string, format: "inr" | "percent" | "number") {
    const num = Number(value);
    if (format === "inr") return formatINRDetailed(num);
    if (format === "percent") return `${num.toFixed(2)}%`;
    return String(Math.round(num));
  }

  const summary = result?.summary ?? null;
  const regime = values.regime ?? "new";
  const showDeductions = config?.id === "income-tax" && regime === "old";
  const primaryResult = config?.results[0];
  const animatedPrimary = useCountUp(
    summary && primaryResult ? Number(summary[primaryResult.key] ?? 0) : null,
  );

  const colorFor = useMemo(() => {
    const chartTheme = getChartTheme(resolvedTheme === "dark");
    return {
      principal: chartTheme.principal,
      interest: chartTheme.interest,
      blue: chartTheme.blue,
      violet: chartTheme.violet,
    } as const;
  }, [resolvedTheme]);

  const chartSegments = useMemo(() => {
    if (!summary || !config?.chart) return [];
    const derived = config.chart.derive?.(summary, parsed) ?? {};
    return config.chart.segments.map((segment) => ({
      name: t[segment.labelKey] as string,
      value: segment.key in derived ? derived[segment.key] : Number(summary[segment.key] ?? 0),
      color: colorFor[segment.color],
    }));
  }, [config, summary, parsed, t, colorFor]);

  if (!config) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t.calcDetails}</CardTitle>
          <CardDescription>{t.calcPageDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {config.fields.map((field) => {
            if (field.id === "deductions" && !showDeductions) return null;

            if (isSelectField(field)) {
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{t[field.labelKey as LabelKey] as string}</Label>
                  <select
                    id={field.id}
                    className="border-input bg-background dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-2.5 py-1 text-base outline-none transition-colors focus-visible:ring-3 md:text-sm"
                    value={values[field.id]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{t[opt.labelKey as LabelKey] as string}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <NumberSliderField
                key={field.id}
                id={field.id}
                label={t[field.labelKey as LabelKey] as string}
                inputMode={field.inputMode ?? "numeric"}
                value={values[field.id]}
                onChange={(next) => setValues((prev) => ({ ...prev, [field.id]: next }))}
                min={field.slider.min}
                max={field.slider.max}
                step={field.slider.step}
              />
            );
          })}

          <Button className="w-full" onClick={calculate} disabled={loading || !canCalculate}>
            {loading ? t.calculating : t.calculate}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="flex flex-col border-primary/25 bg-gradient-to-br from-primary/[0.04] via-card to-card dark:from-primary/10 dark:via-card/60 dark:to-card/60">
        <CardHeader>
          <CardTitle>{t.results}</CardTitle>
          <CardDescription>{t.genericResultsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {summary && primaryResult ? (
            <div className="space-y-6 transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-2 starting:opacity-0 motion-reduce:starting:translate-y-0">
              <div>
                <p className="text-sm text-muted-foreground">{t[primaryResult.labelKey as LabelKey] as string}</p>
                <p className="font-display text-4xl font-semibold tracking-tight text-primary tabular-nums">
                  {primaryResult.format === "inr"
                    ? formatINRDetailed(animatedPrimary)
                    : formatResult(String(animatedPrimary), primaryResult.format)}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {config.results.slice(1).map((row) => (
                  <div key={row.key} className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t[row.labelKey as LabelKey] as string}</p>
                    <p className="mt-1 text-lg font-medium tabular-nums">
                      {formatResult(summary[row.key] ?? "0", row.format)}
                    </p>
                  </div>
                ))}
              </div>
              {chartSegments.length > 0 && <GenericResultPie segments={chartSegments} compact />}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              {t.emptyCalcResults}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
