"use client";

import { useMemo, useState } from "react";

import { NumberSliderField } from "@/components/number-slider-field";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmiCharts } from "@/features/loan/emi-charts";
import { useCountUp } from "@/hooks/use-count-up";
import { apiPost } from "@/lib/api";
import { formatINR, formatINRDetailed, formatINRLakhCrore, parseINRInput } from "@/lib/format";
import { LOAN_DEFAULTS, LOAN_TENURE_PRESETS, type LoanType } from "@/lib/loan/config";
import type { AmortizationResponse, EmiRequest } from "@/types/loan";

const PRINCIPAL_MAX: Record<LoanType, number> = {
  home: 30000000,
  personal: 5000000,
  car: 10000000,
};

const PRINCIPAL_STEP: Record<LoanType, number> = {
  home: 50000,
  personal: 10000,
  car: 10000,
};

const TENURE_MAX_YEARS: Record<LoanType, number> = {
  home: 30,
  personal: 7,
  car: 8,
};

type EmiCalculatorProps = {
  loanType: LoanType;
};

export function EmiCalculator({ loanType }: EmiCalculatorProps) {
  const { t, language } = useLanguage();
  const defaults = LOAN_DEFAULTS[loanType];
  const [principal, setPrincipal] = useState(defaults.principal);
  const [rate, setRate] = useState(defaults.rate);
  const [tenureYears, setTenureYears] = useState(defaults.tenureYears);
  const [result, setResult] = useState<AmortizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const principalNum = useMemo(() => parseINRInput(principal), [principal]);
  const rateNum = useMemo(() => Number(rate), [rate]);
  const tenureMonths = useMemo(() => Math.round(Number(tenureYears) * 12), [tenureYears]);
  const tenurePresets = LOAN_TENURE_PRESETS[loanType];

  const canCalculate =
    principalNum > 0 && rateNum >= 0 && Number.isFinite(rateNum) && tenureMonths > 0 && tenureMonths <= 600;

  async function calculate() {
    if (!canCalculate) return;

    setLoading(true);
    setError(null);
    try {
      const payload: EmiRequest = {
        principal: principalNum,
        annual_interest_rate: rateNum,
        tenure_months: tenureMonths,
      };
      const data = await apiPost<AmortizationResponse>("/api/v1/loans/amortization", payload);
      setResult(data);
    } catch {
      setResult(null);
      setError(t.calcError);
    } finally {
      setLoading(false);
    }
  }

  function applyTenurePreset(months: number) {
    const years = months / 12;
    setTenureYears(Number.isInteger(years) ? String(years) : years.toFixed(1));
  }

  const summary = result?.summary ?? null;
  const presetActive = (months: number) => Math.round(Number(tenureYears) * 12) === months;
  const animatedEmi = useCountUp(summary ? Number(summary.monthly_emi) : null);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>{t.loanDetails}</CardTitle>
            <CardDescription>{t.loanDetailsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <NumberSliderField
              id="principal"
              label={t.loanAmount}
              inputMode="numeric"
              value={principal}
              onChange={setPrincipal}
              min={100000}
              max={PRINCIPAL_MAX[loanType]}
              step={PRINCIPAL_STEP[loanType]}
              placeholder={t.loanAmountPlaceholder}
              helper={
                principalNum > 0 ? (
                  <p className="text-xs font-medium text-primary">
                    {formatINRLakhCrore(principalNum, language)}
                    <span className="font-normal text-muted-foreground"> · {formatINR(principalNum)}</span>
                  </p>
                ) : undefined
              }
            />

            <NumberSliderField
              id="rate"
              label={t.interestRate}
              inputMode="decimal"
              value={rate}
              onChange={setRate}
              min={1}
              max={20}
              step={0.05}
              placeholder={t.interestRatePlaceholder}
            />

            <div className="space-y-2">
              <NumberSliderField
                id="tenure"
                label={t.tenureYearsLabel}
                inputMode="decimal"
                value={tenureYears}
                onChange={setTenureYears}
                min={1}
                max={TENURE_MAX_YEARS[loanType]}
                step={1}
                placeholder={t.tenurePlaceholder}
                helper={<p className="text-xs text-muted-foreground">{t.tenureHint}</p>}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {tenurePresets.map((months) => (
                  <Button
                    key={months}
                    type="button"
                    size="sm"
                    variant={presetActive(months) ? "default" : "outline"}
                    onClick={() => applyTenurePreset(months)}
                  >
                    {t.tenureYears(months / 12)}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={calculate} disabled={loading || !canCalculate}>
              {loading ? t.calculating : t.calculateEmi}
            </Button>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary/25 bg-gradient-to-br from-primary/[0.04] via-card to-card dark:from-primary/10 dark:via-card/60 dark:to-card/60">
          <CardHeader>
            <CardTitle>{t.results}</CardTitle>
            <CardDescription>{t.resultsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-6">
            {summary ? (
              <div className="space-y-6 transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-2 starting:opacity-0 motion-reduce:starting:translate-y-0">
                <div>
                  <p className="text-sm text-muted-foreground">{t.monthlyEmi}</p>
                  <p className="font-display text-4xl font-semibold tracking-tight text-primary tabular-nums transition-transform">
                    {formatINRDetailed(animatedEmi)}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalPayment}</p>
                    <p className="mt-1 text-lg font-medium tabular-nums">{formatINR(Number(summary.total_payment))}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalInterest}</p>
                    <p className="mt-1 text-lg font-medium tabular-nums">{formatINR(Number(summary.total_interest))}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                {t.emptyResults}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-3 starting:opacity-0 motion-reduce:starting:translate-y-0">
          <EmiCharts
            summary={result.summary}
            schedule={result.schedule}
            principalAmount={principalNum}
          />
        </div>
      )}
    </div>
  );
}
