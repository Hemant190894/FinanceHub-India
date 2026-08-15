export type LoanType = "home" | "personal" | "car";

export const LOAN_EMI_PATHS: Record<LoanType, string> = {
  home: "/calculators/home-loan-emi",
  personal: "/calculators/personal-loan-emi",
  car: "/calculators/car-loan-emi",
};

/** Quick-pick tenure options in months — user can also type any tenure manually. */
export const LOAN_TENURE_PRESETS: Record<LoanType, number[]> = {
  home: [120, 180, 240, 300, 360],
  personal: [12, 24, 36, 48, 60],
  car: [36, 48, 60, 72, 84],
};

/** Illustrative defaults — user can change any field. */
export const LOAN_DEFAULTS: Record<
  LoanType,
  { principal: string; rate: string; tenureYears: string }
> = {
  home: { principal: "5000000", rate: "8.5", tenureYears: "20" },
  personal: { principal: "500000", rate: "12", tenureYears: "3" },
  car: { principal: "800000", rate: "9", tenureYears: "5" },
};

export type LoanPageCopyKeys = {
  pageTitle: keyof import("@/lib/i18n/types").TranslationKeys;
  pageDescription: keyof import("@/lib/i18n/types").TranslationKeys;
  navLabel: keyof import("@/lib/i18n/types").TranslationKeys;
  catalogLabel: keyof import("@/lib/i18n/types").TranslationKeys;
};

export const LOAN_PAGE_COPY: Record<LoanType, LoanPageCopyKeys> = {
  home: {
    pageTitle: "homeLoanPageTitle",
    pageDescription: "homeLoanPageDescription",
    navLabel: "navHomeLoanEmi",
    catalogLabel: "calcHomeLoanEmi",
  },
  personal: {
    pageTitle: "personalLoanPageTitle",
    pageDescription: "personalLoanPageDescription",
    navLabel: "navPersonalLoanEmi",
    catalogLabel: "calcPersonalLoanEmi",
  },
  car: {
    pageTitle: "carLoanPageTitle",
    pageDescription: "carLoanPageDescription",
    navLabel: "navCarLoanEmi",
    catalogLabel: "calcCarLoanEmi",
  },
};
