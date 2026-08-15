export type EmiRequest = {
  principal: number;
  annual_interest_rate: number;
  tenure_months: number;
};

export type EmiResponse = {
  monthly_emi: string;
  total_payment: string;
  total_interest: string;
  tenure_months: number;
};

export type AmortizationRow = {
  month: number;
  emi: string;
  principal: string;
  interest: string;
  balance: string;
};

export type AmortizationResponse = {
  summary: EmiResponse;
  schedule: AmortizationRow[];
};
