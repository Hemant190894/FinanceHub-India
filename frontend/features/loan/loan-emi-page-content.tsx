"use client";

import { LoanCalculatorNav } from "@/components/loan-calculator-nav";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/providers/language-provider";
import { EmiCalculator } from "@/features/loan/emi-calculator";
import { LOAN_PAGE_COPY, type LoanType } from "@/lib/loan/config";

export function LoanEmiPageContent({ loanType }: { loanType: LoanType }) {
  const { t } = useLanguage();
  const copy = LOAN_PAGE_COPY[loanType];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <LoanCalculatorNav />
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t[copy.pageTitle] as string}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t[copy.pageDescription] as string}</p>
        </div>
        <EmiCalculator loanType={loanType} />
      </main>
    </div>
  );
}
