"use client";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/providers/language-provider";
import { SipCalculator } from "@/features/investment/sip-calculator";

export function SipPageContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t.sipPageTitle}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.sipPageDescription}</p>
        </div>
        <SipCalculator />
      </main>
    </div>
  );
}
