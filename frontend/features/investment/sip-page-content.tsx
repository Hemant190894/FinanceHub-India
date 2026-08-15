"use client";

import { SitePageLayout } from "@/components/site-page-layout";
import { useLanguage } from "@/components/providers/language-provider";
import { SipCalculator } from "@/features/investment/sip-calculator";

export function SipPageContent() {
  const { t } = useLanguage();

  return (
    <SitePageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t.sipPageTitle}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t.sipPageDescription}</p>
      </div>
      <SipCalculator />
    </SitePageLayout>
  );
}
