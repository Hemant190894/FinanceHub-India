"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { SipModeNav } from "@/components/sip-mode-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SipCharts } from "@/features/investment/sip-charts";
import { SipSplitPie } from "@/features/investment/sip-split-pie";
import { apiPost } from "@/lib/api";
import { formatINR, formatINRDetailed, formatINRLakhCrore, parseINRInput } from "@/lib/format";
import {
  SIP_DEFAULTS,
  SIP_TENURE_PRESETS_YEARS,
  getSipProjectionTenures,
  type SipMode,
} from "@/lib/investment/config";
import type { SipRequest, SipResultWithProjections } from "@/types/investment";

const DIP_AMOUNT_PRESETS = [1000, 2000] as const;

const MODE_DESC_KEYS: Record<SipMode, keyof import("@/lib/i18n/types").TranslationKeys> = {
  normal: "sipModeNormalDesc",
  pro: "sipModeProDesc",
  "pro-plus": "sipModeProPlusDesc",
};

export function SipCalculator() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<SipMode>("normal");
  const [monthlyInvestment, setMonthlyInvestment] = useState(SIP_DEFAULTS.monthlyInvestment);
  const [annualReturn, setAnnualReturn] = useState(SIP_DEFAULTS.annualReturn);
  const [tenureYears, setTenureYears] = useState(SIP_DEFAULTS.tenureYears);
  const [annualStepUp, setAnnualStepUp] = useState(SIP_DEFAULTS.annualStepUp);
  const [proPlusStepUpEnabled, setProPlusStepUpEnabled] = useState(false);
  const [dipsPerMonth, setDipsPerMonth] = useState(SIP_DEFAULTS.dipsPerMonth);
  const [amountPerDip, setAmountPerDip] = useState(SIP_DEFAULTS.amountPerDip);
  const [result, setResult] = useState<SipResultWithProjections | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const monthlyNum = useMemo(() => parseINRInput(monthlyInvestment), [monthlyInvestment]);
  const returnNum = useMemo(() => Number(annualReturn), [annualReturn]);
  const tenureNum = useMemo(() => Number(tenureYears), [tenureYears]);
  const stepUpNum = useMemo(() => Number(annualStepUp), [annualStepUp]);
  const dipsPerMonthNum = useMemo(() => Number(dipsPerMonth), [dipsPerMonth]);
  const amountPerDipNum = useMemo(() => parseINRInput(amountPerDip), [amountPerDip]);
  const isProPlus = mode === "pro-plus";
  const isPro = mode === "pro";
  const stepUpActive = isPro || (isProPlus && proPlusStepUpEnabled);
  const monthlyDipExtra = dipsPerMonthNum * amountPerDipNum;

  const canCalculate =
    monthlyNum > 0 &&
    returnNum >= 0 &&
    Number.isFinite(returnNum) &&
    tenureNum > 0 &&
    tenureNum <= 50 &&
    Number.isFinite(tenureNum) &&
    (!stepUpActive || (stepUpNum > 0 && stepUpNum <= 100 && Number.isFinite(stepUpNum))) &&
    (!isProPlus ||
      (dipsPerMonthNum > 0 &&
        dipsPerMonthNum <= 31 &&
        Number.isFinite(dipsPerMonthNum) &&
        amountPerDipNum > 0));

  function handleModeChange(next: SipMode) {
    setMode(next);
    setResult(null);
    setError(null);
  }

  function buildPayload(tenureYears: number): SipRequest {
    return {
      monthly_investment: monthlyNum,
      annual_return_rate: returnNum,
      tenure_years: tenureYears,
      annual_step_up_rate: stepUpActive ? stepUpNum : 0,
      dips_per_month: isProPlus ? dipsPerMonthNum : 0,
      amount_per_dip: isProPlus ? amountPerDipNum : 0,
    };
  }

  async function calculate() {
    if (!canCalculate) return;

    setLoading(true);
    setError(null);
    try {
      const userTenureYears = Math.round(tenureNum);
      const payload = buildPayload(userTenureYears);
      const data = await apiPost<SipResultWithProjections>("/api/v1/investments/sip", payload);

      const projectionTenures = getSipProjectionTenures(userTenureYears);
      const projections = await Promise.all(
        projectionTenures.map(async (years) => {
          const projection = await apiPost<SipResultWithProjections>("/api/v1/investments/sip", {
            ...payload,
            tenure_years: years,
          });
          return {
            tenureYears: years,
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
  const hasDips = summary != null && Number(summary.total_dip_invested) > 0;
  const presetActive = (years: number) => Math.round(tenureNum) === years;

  return (
    <div className="space-y-8">
      <SipModeNav mode={mode} onModeChange={handleModeChange} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{t.sipDetails}</CardTitle>
            <CardDescription>{t[MODE_DESC_KEYS[mode]] as string}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
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
              <div className="space-y-3 rounded-xl border border-emerald-600/20 bg-emerald-500/5 p-4">
                <div className="space-y-2">
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
              </div>
            )}

            {isProPlus && (
              <div className="space-y-4 rounded-xl border border-violet-600/25 bg-violet-500/5 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 rounded border-border accent-violet-600"
                    checked={proPlusStepUpEnabled}
                    onChange={(e) => setProPlusStepUpEnabled(e.target.checked)}
                  />
                  <span className="text-sm font-medium leading-snug">{t.proPlusStepUpToggle}</span>
                </label>

                {proPlusStepUpEnabled && (
                  <div className="space-y-2 border-t border-violet-600/15 pt-3">
                    <Label htmlFor="step-up-pro-plus">{t.annualStepUp}</Label>
                    <Input
                      id="step-up-pro-plus"
                      inputMode="decimal"
                      value={annualStepUp}
                      onChange={(e) => setAnnualStepUp(e.target.value)}
                      placeholder={t.annualStepUpPlaceholder}
                    />
                    <p className="text-xs text-muted-foreground">{t.stepUpSipHint}</p>
                  </div>
                )}

                <div className="space-y-3 border-t border-violet-600/15 pt-3">
                  <div>
                    <p className="text-sm font-medium">{t.dipBuyingTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.dipBuyingDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dips-per-month">{t.dipsPerMonth}</Label>
                    <Input
                      id="dips-per-month"
                      inputMode="decimal"
                      value={dipsPerMonth}
                      onChange={(e) => setDipsPerMonth(e.target.value)}
                      placeholder={t.dipsPerMonthPlaceholder}
                    />
                    <p className="text-xs text-muted-foreground">{t.dipsPerMonthHint}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount-per-dip">{t.amountPerDip}</Label>
                    <Input
                      id="amount-per-dip"
                      inputMode="numeric"
                      value={amountPerDip}
                      onChange={(e) => setAmountPerDip(e.target.value)}
                      placeholder={t.amountPerDipPlaceholder}
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DIP_AMOUNT_PRESETS.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          size="sm"
                          variant={amountPerDipNum === amount ? "default" : "outline"}
                          className={amountPerDipNum === amount ? "bg-violet-600 hover:bg-violet-500" : ""}
                          onClick={() => setAmountPerDip(String(amount))}
                        >
                          ₹{amount.toLocaleString("en-IN")}
                        </Button>
                      ))}
                    </div>
                    {amountPerDipNum > 0 && (
                      <p className="text-xs font-medium text-violet-700 dark:text-violet-400">
                        {formatINRLakhCrore(amountPerDipNum, language)}
                        <span className="font-normal text-muted-foreground"> · {formatINR(amountPerDipNum)}</span>
                      </p>
                    )}
                  </div>

                  {dipsPerMonthNum > 0 && amountPerDipNum > 0 && (
                    <p className="rounded-lg border border-violet-600/20 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                      {t.monthlyDipPreview(dipsPerMonthNum, amountPerDipNum, monthlyDipExtra)}
                    </p>
                  )}
                </div>
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
                  {hasDips && (
                    <div className="rounded-xl border border-border bg-background/40 p-4 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">{t.totalDipInvested}</p>
                      <p className="mt-1 text-lg font-medium">
                        {formatINR(Number(summary.total_dip_invested))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.monthlyExtraFromDips}: {formatINR(Number(summary.monthly_dip_investment))}
                        {" · "}
                        {summary.dips_per_month} × {formatINR(Number(summary.amount_per_dip))}
                      </p>
                    </div>
                  )}
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
                <SipSplitPie summary={summary} compact />
              </>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                {t.emptySipResults}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <SipCharts
          yearly={result.yearly}
          userTenureYears={result.userTenureYears}
          projections={result.projections}
        />
      )}
    </div>
  );
}
