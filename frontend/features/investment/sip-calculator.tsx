"use client";

import { useMemo, useState } from "react";

import { NumberSliderField } from "@/components/number-slider-field";
import { useLanguage } from "@/components/providers/language-provider";
import { SipModeNav } from "@/components/sip-mode-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SipCharts } from "@/features/investment/sip-charts";
import { SipSplitPie } from "@/features/investment/sip-split-pie";
import { useCountUp } from "@/hooks/use-count-up";
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
  const animatedMaturity = useCountUp(summary ? Number(summary.maturity_value) : null);

  return (
    <div className="space-y-8">
      <SipModeNav mode={mode} onModeChange={handleModeChange} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>{t.sipDetails}</CardTitle>
            <CardDescription>{t[MODE_DESC_KEYS[mode]] as string}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <NumberSliderField
              id="monthly"
              label={t.monthlyInvestment}
              inputMode="numeric"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={500}
              max={500000}
              step={500}
              placeholder={t.monthlyInvestmentPlaceholder}
              helper={
                monthlyNum > 0 ? (
                  <p className="text-xs font-medium text-primary">
                    {formatINRLakhCrore(monthlyNum, language)}
                    <span className="font-normal text-muted-foreground"> · {formatINR(monthlyNum)}</span>
                  </p>
                ) : undefined
              }
            />

            <NumberSliderField
              id="return"
              label={t.expectedReturn}
              inputMode="decimal"
              value={annualReturn}
              onChange={setAnnualReturn}
              min={1}
              max={30}
              step={0.1}
              placeholder={t.expectedReturnPlaceholder}
              helper={<p className="text-xs text-muted-foreground">{t.expectedReturnHint}</p>}
            />

            {isPro && (
              <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <NumberSliderField
                  id="step-up"
                  label={t.annualStepUp}
                  inputMode="decimal"
                  value={annualStepUp}
                  onChange={setAnnualStepUp}
                  min={1}
                  max={50}
                  step={1}
                  placeholder={t.annualStepUpPlaceholder}
                  helper={<p className="text-xs text-muted-foreground">{t.stepUpSipHint}</p>}
                />
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
                  <div className="border-t border-violet-600/15 pt-3">
                    <NumberSliderField
                      id="step-up-pro-plus"
                      label={t.annualStepUp}
                      inputMode="decimal"
                      value={annualStepUp}
                      onChange={setAnnualStepUp}
                      min={1}
                      max={50}
                      step={1}
                      placeholder={t.annualStepUpPlaceholder}
                      helper={<p className="text-xs text-muted-foreground">{t.stepUpSipHint}</p>}
                    />
                  </div>
                )}

                <div className="space-y-3 border-t border-violet-600/15 pt-3">
                  <div>
                    <p className="text-sm font-medium">{t.dipBuyingTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.dipBuyingDesc}</p>
                  </div>

                  <NumberSliderField
                    id="dips-per-month"
                    label={t.dipsPerMonth}
                    inputMode="decimal"
                    value={dipsPerMonth}
                    onChange={setDipsPerMonth}
                    min={1}
                    max={31}
                    step={1}
                    placeholder={t.dipsPerMonthPlaceholder}
                    helper={<p className="text-xs text-muted-foreground">{t.dipsPerMonthHint}</p>}
                  />

                  <div className="space-y-2">
                    <NumberSliderField
                      id="amount-per-dip"
                      label={t.amountPerDip}
                      inputMode="numeric"
                      value={amountPerDip}
                      onChange={setAmountPerDip}
                      min={100}
                      max={100000}
                      step={100}
                      placeholder={t.amountPerDipPlaceholder}
                      helper={<></>}
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
              <NumberSliderField
                id="tenure"
                label={t.tenureYearsLabel}
                inputMode="decimal"
                value={tenureYears}
                onChange={setTenureYears}
                min={1}
                max={50}
                step={1}
                placeholder={t.tenurePlaceholder}
                helper={<p className="text-xs text-muted-foreground">{t.tenureHint}</p>}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {SIP_TENURE_PRESETS_YEARS.map((years) => (
                  <Button
                    key={years}
                    type="button"
                    size="sm"
                    variant={presetActive(years) ? "default" : "outline"}
                    onClick={() => setTenureYears(String(years))}
                  >
                    {t.tenureYears(years)}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={calculate} disabled={loading || !canCalculate}>
              {loading ? t.calculating : t.calculateSip}
            </Button>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary/25 bg-gradient-to-br from-primary/[0.04] via-card to-card dark:from-primary/10 dark:via-card/60 dark:to-card/60">
          <CardHeader>
            <CardTitle>{t.results}</CardTitle>
            <CardDescription>{t.sipResultsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-6">
            {summary ? (
              <div className="space-y-6 transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-2 starting:opacity-0 motion-reduce:starting:translate-y-0">
                <div>
                  <p className="text-sm text-muted-foreground">{t.maturityValue}</p>
                  <p className="font-display text-4xl font-semibold tracking-tight text-primary tabular-nums">
                    {formatINRDetailed(animatedMaturity)}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.totalInvested}</p>
                    <p className="mt-1 text-lg font-medium tabular-nums">{formatINR(Number(summary.total_invested))}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">{t.estimatedReturns}</p>
                    <p className="mt-1 text-lg font-medium tabular-nums">{formatINR(Number(summary.estimated_returns))}</p>
                  </div>
                  {hasDips && (
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-4 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">{t.totalDipInvested}</p>
                      <p className="mt-1 text-lg font-medium tabular-nums">
                        {formatINR(Number(summary.total_dip_invested))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {t.monthlyExtraFromDips}: {formatINR(Number(summary.monthly_dip_investment))}
                        {" · "}
                        {summary.dips_per_month} × {formatINR(Number(summary.amount_per_dip))}
                      </p>
                    </div>
                  )}
                  {hasStepUp && (
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-4 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">{t.finalMonthlySip}</p>
                      <p className="mt-1 text-lg font-medium tabular-nums">
                        {formatINR(Number(summary.final_monthly_investment))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {formatINR(Number(summary.monthly_investment))} → +{summary.annual_step_up_rate}% / year
                      </p>
                    </div>
                  )}
                </div>
                <SipSplitPie summary={summary} compact />
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                {t.emptySipResults}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-3 starting:opacity-0 motion-reduce:starting:translate-y-0">
          <SipCharts
            yearly={result.yearly}
            userTenureYears={result.userTenureYears}
            projections={result.projections}
          />
        </div>
      )}
    </div>
  );
}
