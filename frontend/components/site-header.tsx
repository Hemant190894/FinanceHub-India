"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {!isHome && (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0 gap-1.5 rounded-full px-3",
              )}
              aria-label={t.navHome}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{t.navHome}</span>
            </Link>
          )}

          <Link href="/" className="flex min-w-0 shrink items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm text-primary ring-1 ring-primary/30">
              ₹
            </span>
            <span className="hidden truncate sm:inline">{t.brand}</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SoundToggle />
          <LanguageToggle />
          <ThemeToggle />
          {isHome && (
            <Link
              href="/calculators/home-loan-emi"
              className={cn(buttonVariants({ size: "sm" }), "hidden rounded-full px-4 sm:inline-flex")}
            >
              {t.tryEmiCalculator}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
