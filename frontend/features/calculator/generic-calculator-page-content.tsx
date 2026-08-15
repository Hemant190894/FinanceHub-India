"use client";

import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/providers/language-provider";
import { GenericCalculator } from "@/features/calculator/generic-calculator";
import { CALCULATOR_BY_SLUG } from "@/lib/calculators/registry";
import type { TranslationKeys } from "@/lib/i18n/types";

type LabelKey = keyof TranslationKeys;

type GenericCalculatorPageContentProps = {
  slug: string;
};

export function GenericCalculatorPageContent({ slug }: GenericCalculatorPageContentProps) {
  const { t } = useLanguage();
  const config = CALCULATOR_BY_SLUG[slug];

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t[config.titleKey as LabelKey] as string}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.calcPageDesc}</p>
        </div>
        <GenericCalculator slug={slug} />
      </main>
    </div>
  );
}
