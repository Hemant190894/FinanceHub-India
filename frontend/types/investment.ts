export type SipRequest = {
  monthly_investment: number;
  annual_return_rate: number;
  tenure_years: number;
  annual_step_up_rate?: number;
};

export type SipSummary = {
  monthly_investment: string;
  annual_step_up_rate: string;
  final_monthly_investment: string;
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
