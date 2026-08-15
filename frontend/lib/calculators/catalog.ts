import { SIP_PATH } from "@/lib/investment/config";
import { LOAN_EMI_PATHS } from "@/lib/loan/config";
import type { LoanType } from "@/lib/loan/config";
import { LOAN_PAGE_COPY } from "@/lib/loan/config";

export type CalculatorItem = {
  id: string;
  labelKey: keyof import("@/lib/i18n/types").TranslationKeys;
  href?: string;
  live?: boolean;
};

export const POPULAR_CALCULATORS: CalculatorItem[] = [
  { id: "sip", labelKey: "calcSip", href: SIP_PATH, live: true },
  { id: "lumpsum", labelKey: "calcLumpsum" },
  { id: "swp", labelKey: "calcSwp" },
  { id: "mf-returns", labelKey: "calcMfReturns" },
  { id: "ssy", labelKey: "calcSsy" },
  { id: "income-tax", labelKey: "calcIncomeTax" },
  { id: "ppf", labelKey: "calcPpf" },
  { id: "epf", labelKey: "calcEpf" },
  { id: "fd", labelKey: "calcFd" },
  { id: "rd", labelKey: "calcRd" },
  { id: "gst", labelKey: "calcGst" },
  { id: "xirr", labelKey: "calcXirr" },
];

function loanItem(type: LoanType): CalculatorItem {
  return {
    id: `${type}-loan-emi`,
    labelKey: LOAN_PAGE_COPY[type].catalogLabel,
    href: LOAN_EMI_PATHS[type],
    live: true,
  };
}

/** Generic loan EMI tools only — no bank-specific pages. */
export const LOAN_EMI_CALCULATORS: CalculatorItem[] = [
  loanItem("home"),
  loanItem("personal"),
  loanItem("car"),
];

/** @deprecated use LOAN_EMI_CALCULATORS */
export const MORE_EMI_CALCULATORS = LOAN_EMI_CALCULATORS;
