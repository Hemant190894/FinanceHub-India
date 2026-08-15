"use client";

import {
  Baby,
  Briefcase,
  Calculator as CalculatorIcon,
  Car,
  ChevronRight,
  Home,
  Landmark,
  LineChart,
  Lock,
  Percent,
  PiggyBank,
  Receipt,
  Repeat,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import type { CalculatorItem } from "@/lib/calculators/catalog";
import { LOAN_EMI_CALCULATORS, POPULAR_CALCULATORS } from "@/lib/calculators/catalog";
import type { TranslationKeys } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const CALCULATOR_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  sip: TrendingUp,
  lumpsum: Wallet,
  swp: Repeat,
  "mf-returns": LineChart,
  ssy: Baby,
  "income-tax": Receipt,
  ppf: Landmark,
  epf: Briefcase,
  fd: Lock,
  rd: PiggyBank,
  gst: Percent,
  xirr: LineChart,
  "home-loan-emi": Home,
  "personal-loan-emi": Wallet,
  "car-loan-emi": Car,
};

function CalculatorTile({ item, label }: { item: CalculatorItem; label: string }) {
  const Icon = CALCULATOR_ICONS[item.id] ?? CalculatorIcon;

  const iconChip = (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        item.href ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-4.5" />
    </span>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex w-full items-center gap-3 rounded-xl border border-primary/15 bg-card px-3.5 py-3 shadow-[var(--shadow-card)] transition-[transform,border-color,box-shadow] duration-150 ease-(--ease-out) hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0"
      >
        {iconChip}
        <span className="min-w-0 flex-1 text-left text-sm font-medium leading-snug">{label}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-(--ease-out) group-hover:translate-x-0.5" />
      </Link>
    );
  }

  return (
    <div
      className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-muted/30 px-3.5 py-3 opacity-80"
      aria-disabled="true"
    >
      {iconChip}
      <span className="min-w-0 flex-1 text-left text-sm font-medium leading-snug">{label}</span>
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
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <CalculatorTile key={item.id} item={item} label={t[item.labelKey] as string} />
        ))}
      </div>
    </div>
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
