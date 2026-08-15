export const SIP_PATH = "/calculators/sip";

export type SipMode = "normal" | "pro" | "pro-plus";

export const SIP_MODES: SipMode[] = ["normal", "pro", "pro-plus"];

export const SIP_TENURE_PRESETS_YEARS = [5, 10, 15, 20, 25];

/** Milestones used for line-chart projections (max 30 years). */
export const SIP_PROJECTION_MILESTONES = [5, 10, 15, 20, 25, 30] as const;

/** Next 1–2 projection horizons above the user's tenure (capped at 30 years). */
export function getSipProjectionTenures(userTenureYears: number): number[] {
  const tenure = Math.round(userTenureYears);
  if (tenure >= 30) return [];

  const above = SIP_PROJECTION_MILESTONES.filter((y) => y > tenure);
  if (tenure === 25) return above.slice(0, 1);
  return above.slice(0, 2);
}

export const SIP_DEFAULTS = {
  monthlyInvestment: "10000",
  annualReturn: "12",
  tenureYears: "10",
  annualStepUp: "10",
};
