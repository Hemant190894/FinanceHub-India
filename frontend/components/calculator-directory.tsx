"use client";

import Link from "next/link";

import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalculatorItem } from "@/lib/calculators/catalog";
import { LOAN_EMI_CALCULATORS, POPULAR_CALCULATORS } from "@/lib/calculators/catalog";
import type { TranslationKeys } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

function CalculatorTile({ item, label }: { item: CalculatorItem; label: string }) {
  const className = cn(
    "flex w-full items-center rounded-xl border px-3 py-2.5 transition-all",
    item.href
      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
      : "cursor-not-allowed border-border bg-muted/30 opacity-80",
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        <span className="text-left text-sm font-medium leading-snug">{label}</span>
      </Link>
    );
  }

  return (
    <div className={className} aria-disabled="true">
      <span className="text-left text-sm font-medium leading-snug">{label}</span>
    </div>
  );
}

function CalculatorSection({
  title,
  description,
  items,
  t,
}: {
  title: string;
  description: string;
  items: CalculatorItem[];
  t: TranslationKeys;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <CalculatorTile key={item.id} item={item} label={t[item.labelKey] as string} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalculatorDirectory() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <CalculatorSection
        title={t.popularCalculatorsTitle}
        description={t.popularCalculatorsDesc}
        items={POPULAR_CALCULATORS}
        t={t}
      />
      <CalculatorSection
        title={t.loanEmiCalculatorsTitle}
        description={t.loanEmiCalculatorsDesc}
        items={LOAN_EMI_CALCULATORS}
        t={t}
      />
    </div>
  );
}
