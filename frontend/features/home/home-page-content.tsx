"use client";

import { GitCompare, Gauge, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PageWithSidebar } from "@/components/page-with-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CalculatorDirectory } from "@/components/calculator-directory";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePageContent() {
  const { t } = useLanguage();

  const features = [
    { title: t.feature1Title, description: t.feature1Desc, icon: GitCompare },
    { title: t.feature2Title, description: t.feature2Desc, icon: Gauge },
    { title: t.feature3Title, description: t.feature3Desc, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background dark:from-primary/15">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              {t.heroTitle1}
              <span className="block text-primary">{t.heroTitle2}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{t.heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calculators/home-loan-emi" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
                {t.ctaStartEmi}
              </Link>
              <Link
                href="#calculators"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full")}
              >
                {t.ctaExplore}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-4 pb-16 sm:px-6">
          <div className="grid gap-8 border-t border-border pt-10 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="calculators" className="mx-auto max-w-[90rem] px-4 pb-24 sm:px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{t.calculatorsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.loanEmiCalculatorsDesc}</p>
          </div>
          <PageWithSidebar>
            <CalculatorDirectory />
          </PageWithSidebar>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        {t.footerDisclaimer}
      </footer>
    </div>
  );
}
