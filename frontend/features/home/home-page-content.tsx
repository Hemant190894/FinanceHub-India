"use client";

import Link from "next/link";

import { PageWithSidebar } from "@/components/page-with-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CalculatorDirectory } from "@/components/calculator-directory";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HomePageContent() {
  const { t } = useLanguage();

  const features = [
    { title: t.feature1Title, description: t.feature1Desc },
    { title: t.feature2Title, description: t.feature2Desc },
    { title: t.feature3Title, description: t.feature3Desc },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background dark:from-emerald-900/20">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{t.heroBadge}</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {t.heroTitle1}
              <span className="block text-emerald-600 dark:text-emerald-400">{t.heroTitle2}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{t.heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/calculators/home-loan-emi"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-emerald-600 hover:bg-emerald-500")}
              >
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
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
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
