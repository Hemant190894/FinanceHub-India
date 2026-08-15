"use client";

import Link from "next/link";

import { PageWithSidebar } from "@/components/page-with-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CalculatorDirectory } from "@/components/calculator-directory";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePageContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background dark:from-emerald-900/20">
      <SiteHeader />

      <main className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 pb-20">
        <PageWithSidebar>
          <div className="space-y-10">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">{t.heroBadge}</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {t.heroTitle1}
                <span className="block text-emerald-600 dark:text-emerald-400">{t.heroTitle2}</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t.heroDescription}</p>
              <div className="mt-6 flex flex-wrap gap-3">
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

            <section id="calculators">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold">{t.calculatorsTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.popularCalculatorsDesc}</p>
              </div>
              <CalculatorDirectory />
            </section>
          </div>
        </PageWithSidebar>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        {t.footerDisclaimer}
      </footer>
    </div>
  );
}
