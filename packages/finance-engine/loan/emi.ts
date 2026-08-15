export type EmiResult = {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  tenureMonths: number;
};

/** Reducing-balance EMI — mirrors backend loan_service for client-side use. */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
): EmiResult {
  if (tenureMonths <= 0 || principal <= 0) {
    throw new Error("Principal and tenure must be positive");
  }

  if (annualRatePercent === 0) {
    const monthlyEmi = principal / tenureMonths;
    return {
      monthlyEmi: roundMoney(monthlyEmi),
      totalPayment: roundMoney(principal),
      totalInterest: 0,
      tenureMonths,
    };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const factor = (1 + monthlyRate) ** tenureMonths;
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyEmi * tenureMonths;

  return {
    monthlyEmi: roundMoney(monthlyEmi),
    totalPayment: roundMoney(totalPayment),
    totalInterest: roundMoney(totalPayment - principal),
    tenureMonths,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
