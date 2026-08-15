"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
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
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((config?.fields ?? []).map((f) => [f.id, f.defaultValue])),
  );
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => {
    const out: Record<string, string | number> = {};
    for (const field of config.fields) {
      out[field.id] = parseFieldValue(field, values[field.id] ?? field.defaultValue);
    }
    return out;
  }, [config.fields, values]);

  const canCalculate = useMemo(() => {
    for (const field of config.fields) {
      if (isSelectField(field)) continue;
      const val = parsed[field.id];
      if (typeof val !== "number" || !Number.isFinite(val)) return false;
      if (field.parse === "inr" && val <= 0) return false;
      if ((field.id === "tenure_years" || field.id === "tenure_months") && val <= 0) return false;
    }
    return true;
  }, [config.fields, parsed]);

  if (!config) return null;

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
  const showDeductions = config.id === "income-tax" && regime === "old";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="border-border bg-card shadow-sm">
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{t[field.labelKey as LabelKey] as string}</Label>
                <Input
                  id={field.id}
                  inputMode={field.inputMode ?? "numeric"}
                  value={values[field.id]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              </div>
            );
          })}

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500"
            onClick={calculate}
            disabled={loading || !canCalculate}
          >
            {loading ? t.calculating : t.calculate}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-emerald-600/25 bg-card shadow-sm dark:border-emerald-500/20">
        <CardHeader>
          <CardTitle>{t.results}</CardTitle>
          <CardDescription>{t.genericResultsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {config.results.map((row) => (
                <div key={row.key} className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">{t[row.labelKey as LabelKey] as string}</p>
                  <p className="mt-1 text-lg font-medium">
                    {formatResult(summary[row.key] ?? "0", row.format)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              {t.emptyCalcResults}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
