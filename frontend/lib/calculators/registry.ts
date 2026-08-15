import type { TranslationKeys } from "@/lib/i18n/types";

type LabelKey = keyof TranslationKeys;

export type CalcField = {
  id: string;
  labelKey: LabelKey;
  defaultValue: string;
  parse: "inr" | "number";
  inputMode?: "numeric" | "decimal";
  placeholder?: string;
  slider: { min: number; max: number; step: number };
};

export type CalcSelectField = {
  id: string;
  labelKey: LabelKey;
  defaultValue: string;
  options: { value: string; labelKey: LabelKey }[];
};

export type CalcResultKey = {
  key: string;
  labelKey: LabelKey;
  format: "inr" | "percent" | "number";
};

export type CalculatorRegistryEntry = {
  id: string;
  slug: string;
  titleKey: LabelKey;
  endpoint: string;
  fields: Array<CalcField | CalcSelectField>;
  results: CalcResultKey[];
  buildPayload: (values: Record<string, string | number>) => Record<string, unknown>;
};

function isSelectField(field: CalcField | CalcSelectField): field is CalcSelectField {
  return "options" in field;
}

export const CALCULATOR_REGISTRY: CalculatorRegistryEntry[] = [
  {
    id: "lumpsum",
    slug: "lumpsum",
    titleKey: "calcLumpsum",
    endpoint: "/api/v1/calculators/lumpsum",
    fields: [
      {
        id: "amount",
        labelKey: "investmentAmount",
        defaultValue: "100000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 10000, max: 10000000, step: 10000 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "12",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 30, step: 0.1 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "10",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 40, step: 1 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "total_invested", labelKey: "totalInvested", format: "inr" },
      { key: "estimated_returns", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      amount: v.amount,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "swp",
    slug: "swp",
    titleKey: "calcSwp",
    endpoint: "/api/v1/calculators/swp",
    fields: [
      {
        id: "corpus",
        labelKey: "corpusAmount",
        defaultValue: "5000000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 100000, max: 50000000, step: 50000 },
      },
      {
        id: "monthly_withdrawal",
        labelKey: "monthlyWithdrawal",
        defaultValue: "25000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 1000, max: 500000, step: 1000 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "8",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 30, step: 0.1 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "20",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 40, step: 1 },
      },
    ],
    results: [
      { key: "remaining_corpus", labelKey: "remainingCorpus", format: "inr" },
      { key: "total_withdrawn", labelKey: "totalWithdrawn", format: "inr" },
      { key: "months_sustained", labelKey: "monthsSustained", format: "number" },
    ],
    buildPayload: (v) => ({
      corpus: v.corpus,
      monthly_withdrawal: v.monthly_withdrawal,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "mf-returns",
    slug: "mf-returns",
    titleKey: "calcMfReturns",
    endpoint: "/api/v1/calculators/mf-returns",
    fields: [
      {
        id: "initial_value",
        labelKey: "initialValue",
        defaultValue: "100000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 10000, max: 10000000, step: 10000 },
      },
      {
        id: "final_value",
        labelKey: "finalValue",
        defaultValue: "250000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 10000, max: 20000000, step: 10000 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "5",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 40, step: 1 },
      },
    ],
    results: [
      { key: "cagr_percent", labelKey: "cagrReturn", format: "percent" },
      { key: "absolute_return", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      initial_value: v.initial_value,
      final_value: v.final_value,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "ssy",
    slug: "ssy",
    titleKey: "calcSsy",
    endpoint: "/api/v1/calculators/ssy",
    fields: [
      {
        id: "yearly_deposit",
        labelKey: "yearlyDeposit",
        defaultValue: "50000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 250, max: 150000, step: 250 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "8.2",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 15, step: 0.05 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "total_invested", labelKey: "totalInvested", format: "inr" },
      { key: "estimated_returns", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      yearly_deposit: v.yearly_deposit,
      annual_return_rate: v.annual_return_rate,
    }),
  },
  {
    id: "income-tax",
    slug: "income-tax",
    titleKey: "calcIncomeTax",
    endpoint: "/api/v1/calculators/income-tax",
    fields: [
      {
        id: "gross_annual_income",
        labelKey: "grossAnnualIncome",
        defaultValue: "1200000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 200000, max: 50000000, step: 50000 },
      },
      {
        id: "regime",
        labelKey: "taxRegime",
        defaultValue: "new",
        options: [
          { value: "new", labelKey: "regimeNew" },
          { value: "old", labelKey: "regimeOld" },
        ],
      },
      {
        id: "deductions",
        labelKey: "deductions80c",
        defaultValue: "150000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 0, max: 500000, step: 5000 },
      },
    ],
    results: [
      { key: "taxable_income", labelKey: "taxableIncome", format: "inr" },
      { key: "income_tax", labelKey: "incomeTaxAmount", format: "inr" },
      { key: "cess", labelKey: "cessAmount", format: "inr" },
      { key: "total_tax", labelKey: "totalTax", format: "inr" },
      { key: "effective_tax_rate", labelKey: "effectiveTaxRate", format: "percent" },
    ],
    buildPayload: (v) => ({
      gross_annual_income: v.gross_annual_income,
      regime: v.regime,
      deductions: v.regime === "old" ? v.deductions : 0,
    }),
  },
  {
    id: "ppf",
    slug: "ppf",
    titleKey: "calcPpf",
    endpoint: "/api/v1/calculators/ppf",
    fields: [
      {
        id: "yearly_deposit",
        labelKey: "yearlyDeposit",
        defaultValue: "150000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 500, max: 150000, step: 500 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "7.1",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 15, step: 0.05 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "15",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 5, max: 50, step: 1 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "total_invested", labelKey: "totalInvested", format: "inr" },
      { key: "estimated_returns", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      yearly_deposit: v.yearly_deposit,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "epf",
    slug: "epf",
    titleKey: "calcEpf",
    endpoint: "/api/v1/calculators/epf",
    fields: [
      {
        id: "monthly_basic",
        labelKey: "monthlyBasic",
        defaultValue: "30000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 5000, max: 500000, step: 1000 },
      },
      {
        id: "employee_contribution_rate",
        labelKey: "employeeRate",
        defaultValue: "12",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 20, step: 0.5 },
      },
      {
        id: "employer_contribution_rate",
        labelKey: "employerRate",
        defaultValue: "12",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 20, step: 0.5 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "8.15",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 15, step: 0.05 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "30",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 40, step: 1 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "total_contributed", labelKey: "totalContribution", format: "inr" },
      { key: "monthly_contribution", labelKey: "monthlyContribution", format: "inr" },
      { key: "estimated_returns", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      monthly_basic: v.monthly_basic,
      employee_contribution_rate: v.employee_contribution_rate,
      employer_contribution_rate: v.employer_contribution_rate,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "fd",
    slug: "fd",
    titleKey: "calcFd",
    endpoint: "/api/v1/calculators/fd",
    fields: [
      {
        id: "amount",
        labelKey: "investmentAmount",
        defaultValue: "100000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 1000, max: 10000000, step: 1000 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "7",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 15, step: 0.05 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "5",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 10, step: 1 },
      },
      {
        id: "compounding_per_year",
        labelKey: "compoundingPerYear",
        defaultValue: "4",
        parse: "number",
        inputMode: "numeric",
        slider: { min: 1, max: 12, step: 1 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "principal", labelKey: "totalInvested", format: "inr" },
      { key: "interest_earned", labelKey: "interestEarned", format: "inr" },
    ],
    buildPayload: (v) => ({
      amount: v.amount,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
      compounding_per_year: Math.round(Number(v.compounding_per_year)),
    }),
  },
  {
    id: "rd",
    slug: "rd",
    titleKey: "calcRd",
    endpoint: "/api/v1/calculators/rd",
    fields: [
      {
        id: "monthly_deposit",
        labelKey: "monthlyInvestment",
        defaultValue: "5000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 500, max: 500000, step: 500 },
      },
      {
        id: "annual_return_rate",
        labelKey: "expectedReturn",
        defaultValue: "6.5",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 15, step: 0.05 },
      },
      {
        id: "tenure_years",
        labelKey: "tenureYearsLabel",
        defaultValue: "5",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 1, max: 10, step: 1 },
      },
    ],
    results: [
      { key: "maturity_value", labelKey: "maturityValue", format: "inr" },
      { key: "total_deposited", labelKey: "totalDeposited", format: "inr" },
      { key: "estimated_returns", labelKey: "estimatedReturns", format: "inr" },
    ],
    buildPayload: (v) => ({
      monthly_deposit: v.monthly_deposit,
      annual_return_rate: v.annual_return_rate,
      tenure_years: Math.round(Number(v.tenure_years)),
    }),
  },
  {
    id: "gst",
    slug: "gst",
    titleKey: "calcGst",
    endpoint: "/api/v1/calculators/gst",
    fields: [
      {
        id: "amount",
        labelKey: "investmentAmount",
        defaultValue: "1000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 100, max: 10000000, step: 100 },
      },
      {
        id: "gst_rate",
        labelKey: "gstRateLabel",
        defaultValue: "18",
        parse: "number",
        inputMode: "decimal",
        slider: { min: 0, max: 28, step: 1 },
      },
      {
        id: "mode",
        labelKey: "taxRegime",
        defaultValue: "add",
        options: [
          { value: "add", labelKey: "gstModeAdd" },
          { value: "remove", labelKey: "gstModeRemove" },
        ],
      },
    ],
    results: [
      { key: "base_amount", labelKey: "baseAmount", format: "inr" },
      { key: "gst_amount", labelKey: "gstAmountLabel", format: "inr" },
      { key: "total_amount", labelKey: "totalAmountLabel", format: "inr" },
    ],
    buildPayload: (v) => ({
      amount: v.amount,
      gst_rate: v.gst_rate,
      mode: v.mode,
    }),
  },
  {
    id: "xirr",
    slug: "xirr",
    titleKey: "calcXirr",
    endpoint: "/api/v1/calculators/xirr",
    fields: [
      {
        id: "invest_amount",
        labelKey: "cashFlowInvest",
        defaultValue: "100000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 1000, max: 10000000, step: 1000 },
      },
      {
        id: "return_amount",
        labelKey: "cashFlowReturn",
        defaultValue: "150000",
        parse: "inr",
        inputMode: "numeric",
        slider: { min: 1000, max: 20000000, step: 1000 },
      },
      {
        id: "tenure_months",
        labelKey: "monthOffset",
        defaultValue: "12",
        parse: "number",
        inputMode: "numeric",
        slider: { min: 1, max: 360, step: 1 },
      },
    ],
    results: [{ key: "xirr_percent", labelKey: "xirrReturn", format: "percent" }],
    buildPayload: (v) => ({
      cash_flows: [
        { amount: -Number(v.invest_amount), month: 0 },
        { amount: Number(v.return_amount), month: Math.round(Number(v.tenure_months)) },
      ],
    }),
  },
];

export const CALCULATOR_BY_SLUG = Object.fromEntries(
  CALCULATOR_REGISTRY.map((entry) => [entry.slug, entry]),
) as Record<string, CalculatorRegistryEntry>;

export function calcPath(slug: string) {
  return `/calculators/${slug}`;
}

export { isSelectField };
