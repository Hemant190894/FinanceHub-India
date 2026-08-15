"use client";

import { SitePageLayout } from "@/components/site-page-layout";
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
    <SitePageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t[config.titleKey as LabelKey] as string}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t.calcPageDesc}</p>
      </div>
      <GenericCalculator slug={slug} />
    </SitePageLayout>
  );
}
