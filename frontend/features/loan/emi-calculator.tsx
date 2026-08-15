"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmiCharts } from "@/features/loan/emi-charts";
import { apiPost } from "@/lib/api";
import { formatINR, formatINRDetailed, formatINRLakhCrore, parseINRInput } from "@/lib/format";
import { LOAN_DEFAULTS, LOAN_TENURE_PRESETS, type LoanType } from "@/lib/loan/config";
import type { AmortizationResponse, EmiRequest } from "@/types/loan";

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

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{t.loanDetails}</CardTitle>
            <CardDescription>{t.loanDetailsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="principal">{t.loanAmount}</Label>
              <Input
                id="principal"
                inputMode="numeric"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder={t.loanAmountPlaceholder}
              />
              {principalNum > 0 && (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {formatINRLakhCrore(principalNum, language)}
                  <span className="font-normal text-muted-foreground"> · {formatINR(principalNum)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">{t.interestRate}</Label>
              <Input
                id="rate"
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder={t.interestRatePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure">{t.tenureYearsLabel}</Label>
              <Input
                id="tenure"
                inputMode="decimal"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                placeholder={t.tenurePlaceholder}
              />
              <p className="text-xs text-muted-foreground">{t.tenureHint}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {tenurePresets.map((months) => (
                  <Button
                    key={months}
                    type="button"
                    size="sm"
                    variant={presetActive(months) ? "default" : "outline"}
                    className={presetActive(months) ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                    onClick={() => applyTenurePreset(months)}
                  >
                    {t.tenureYears(months / 12)}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              onClick={calculate}
              disabled={loading || !canCalculate}
            >
              {loading ? t.calculating : t.calculateEmi}
            </Button>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card className="border-emerald-600/25 bg-card shadow-sm dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-card/60 dark:to-card/60">
          <CardHeader>
            <CardTitle>{t.results}</CardTitle>
            <CardDescription>{t.resultsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {summary ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">{t.monthlyEmi}</p>
                  <p className="text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatINRDetailed(Number(summary.monthly_emi))}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalPayment}</p>
                    <p className="mt-1 text-lg font-medium">{formatINR(Number(summary.total_payment))}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalInterest}</p>
                    <p className="mt-1 text-lg font-medium">{formatINR(Number(summary.total_interest))}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                {t.emptyResults}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <EmiCharts
          summary={result.summary}
          schedule={result.schedule}
          principalAmount={principalNum}
        />
      )}
    </div>
  );
}
