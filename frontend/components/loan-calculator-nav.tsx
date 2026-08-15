"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/providers/language-provider";
import { LOAN_EMI_PATHS, LOAN_PAGE_COPY, type LoanType } from "@/lib/loan/config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const LOAN_TYPES: LoanType[] = ["home", "personal", "car"];

export function LoanCalculatorNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label="Loan calculators">
      {LOAN_TYPES.map((type) => {
        const href = LOAN_EMI_PATHS[type];
        const active = pathname === href;
        const label = t[LOAN_PAGE_COPY[type].navLabel] as string;

        return (
          <Link
            key={type}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }), "rounded-full px-4")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
