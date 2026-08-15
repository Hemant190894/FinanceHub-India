"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { SipModeNav } from "@/components/sip-mode-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SipCharts } from "@/features/investment/sip-charts";
import { apiPost } from "@/lib/api";
import { formatINR, formatINRDetailed, formatINRLakhCrore, parseINRInput } from "@/lib/format";
import { SIP_DEFAULTS, SIP_TENURE_PRESETS_YEARS, getSipProjectionTenures, type SipMode } from "@/lib/investment/config";
import type { SipRequest, SipResultWithProjections } from "@/types/investment";

const MODE_DESC_KEYS: Record<Exclude<SipMode, "pro-plus">, keyof import("@/lib/i18n/types").TranslationKeys> = {
  normal: "sipModeNormalDesc",
  pro: "sipModeProDesc",
};

export function SipCalculator() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<SipMode>("normal");
  const [monthlyInvestment, setMonthlyInvestment] = useState(SIP_DEFAULTS.monthlyInvestment);
  const [annualReturn, setAnnualReturn] = useState(SIP_DEFAULTS.annualReturn);
  const [tenureYears, setTenureYears] = useState(SIP_DEFAULTS.tenureYears);
  const [annualStepUp, setAnnualStepUp] = useState(SIP_DEFAULTS.annualStepUp);
  const [result, setResult] = useState<SipResultWithProjections | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const monthlyNum = useMemo(() => parseINRInput(monthlyInvestment), [monthlyInvestment]);
  const returnNum = useMemo(() => Number(annualReturn), [annualReturn]);
  const tenureNum = useMemo(() => Number(tenureYears), [tenureYears]);
  const stepUpNum = useMemo(() => Number(annualStepUp), [annualStepUp]);
  const isProPlus = mode === "pro-plus";
  const isPro = mode === "pro";

  const canCalculate =
    !isProPlus &&
    monthlyNum > 0 &&
    returnNum >= 0 &&
    Number.isFinite(returnNum) &&
    tenureNum > 0 &&
    tenureNum <= 50 &&
    Number.isFinite(tenureNum) &&
    (!isPro || (stepUpNum > 0 && stepUpNum <= 100 && Number.isFinite(stepUpNum)));

  function handleModeChange(next: SipMode) {
    setMode(next);
    setResult(null);
    setError(null);
  }

  async function calculate() {
    if (!canCalculate) return;

    setLoading(true);
    setError(null);
    try {
      const userTenureYears = Math.round(tenureNum);
      const payload: SipRequest = {
        monthly_investment: monthlyNum,
        annual_return_rate: returnNum,
        tenure_years: userTenureYears,
        annual_step_up_rate: isPro ? stepUpNum : 0,
      };
      const data = await apiPost<SipResultWithProjections>("/api/v1/investments/sip", payload);

      const projectionTenures = getSipProjectionTenures(userTenureYears);
      const projections = await Promise.all(
        projectionTenures.map(async (tenureYears) => {
          const projection = await apiPost<SipResultWithProjections>("/api/v1/investments/sip", {
            ...payload,
            tenure_years: tenureYears,
          });
          return {
            tenureYears,
            summary: projection.summary,
            yearly: projection.yearly,
          };
        }),
      );

      setResult({ ...data, userTenureYears, projections });
    } catch {
      setResult(null);
      setError(t.calcError);
    } finally {
      setLoading(false);
    }
  }

  const summary = result?.summary ?? null;
  const hasStepUp = summary != null && Number(summary.annual_step_up_rate) > 0;
  const presetActive = (years: number) => Math.round(tenureNum) === years;
  const modeDescription = isProPlus ? t.sipProPlusSoon : (t[MODE_DESC_KEYS[mode]] as string);

  return (
    <div className="space-y-8">
      <SipModeNav mode={mode} onModeChange={handleModeChange} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{t.sipDetails}</CardTitle>
            <CardDescription>{modeDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isProPlus ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
                <p className="text-sm font-medium">{t.sipModeProPlus}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.sipProPlusSoon}</p>
                <p className="mt-4 text-xs text-muted-foreground">{t.comingSoon}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthly">{t.monthlyInvestment}</Label>
                  <Input
                    id="monthly"
                    inputMode="numeric"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                    placeholder={t.monthlyInvestmentPlaceholder}
                  />
                  {monthlyNum > 0 && (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {formatINRLakhCrore(monthlyNum, language)}
                      <span className="font-normal text-muted-foreground"> · {formatINR(monthlyNum)}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return">{t.expectedReturn}</Label>
                  <Input
                    id="return"
                    inputMode="decimal"
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(e.target.value)}
                    placeholder={t.expectedReturnPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">{t.expectedReturnHint}</p>
                </div>

                {isPro && (
                  <div className="space-y-2 rounded-xl border border-emerald-600/20 bg-emerald-500/5 p-4">
                    <Label htmlFor="step-up">{t.annualStepUp}</Label>
                    <Input
                      id="step-up"
                      inputMode="decimal"
                      value={annualStepUp}
                      onChange={(e) => setAnnualStepUp(e.target.value)}
                      placeholder={t.annualStepUpPlaceholder}
                    />
                    <p className="text-xs text-muted-foreground">{t.stepUpSipHint}</p>
                  </div>
                )}

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
                    {SIP_TENURE_PRESETS_YEARS.map((years) => (
                      <Button
                        key={years}
                        type="button"
                        size="sm"
                        variant={presetActive(years) ? "default" : "outline"}
                        className={presetActive(years) ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                        onClick={() => setTenureYears(String(years))}
                      >
                        {t.tenureYears(years)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                  onClick={calculate}
                  disabled={loading || !canCalculate}
                >
                  {loading ? t.calculating : t.calculateSip}
                </Button>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-600/25 bg-card shadow-sm dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-card/60 dark:to-card/60">
          <CardHeader>
            <CardTitle>{t.results}</CardTitle>
            <CardDescription>{t.sipResultsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {summary ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">{t.maturityValue}</p>
                  <p className="text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatINRDetailed(Number(summary.maturity_value))}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalInvested}</p>
                    <p className="mt-1 text-lg font-medium">{formatINR(Number(summary.total_invested))}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.estimatedReturns}</p>
                    <p className="mt-1 text-lg font-medium">{formatINR(Number(summary.estimated_returns))}</p>
                  </div>
                  {hasStepUp && (
                    <div className="rounded-xl border border-border bg-background/40 p-4 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">{t.finalMonthlySip}</p>
                      <p className="mt-1 text-lg font-medium">
                        {formatINR(Number(summary.final_monthly_investment))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatINR(Number(summary.monthly_investment))} → +{summary.annual_step_up_rate}% / year
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                {isProPlus ? t.sipProPlusSoon : t.emptySipResults}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && mode !== "pro-plus" && (
        <SipCharts
          summary={result.summary}
          yearly={result.yearly}
          userTenureYears={result.userTenureYears}
          projections={result.projections}
        />
      )}
    </div>
  );
}
