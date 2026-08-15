export type SipRequest = {
  monthly_investment: number;
  annual_return_rate: number;
  tenure_years: number;
  annual_step_up_rate?: number;
  dips_per_month?: number;
  amount_per_dip?: number;
};

export type SipSummary = {
  monthly_investment: string;
  annual_step_up_rate: string;
  dips_per_month: string;
  amount_per_dip: string;
  monthly_dip_investment: string;
  final_monthly_investment: string;
  total_dip_invested: string;
  tenure_months: number;
  total_invested: string;
  estimated_returns: string;
  maturity_value: string;
};

export type SipYearlyRow = {
  year: number;
  invested: string;
  corpus: string;
  gains: string;
};

export type SipResponse = {
  summary: SipSummary;
  yearly: SipYearlyRow[];
};

export type SipProjection = {
  tenureYears: number;
  summary: SipSummary;
  yearly: SipYearlyRow[];
};

export type SipResultWithProjections = SipResponse & {
  userTenureYears: number;
  projections: SipProjection[];
};
