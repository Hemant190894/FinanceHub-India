export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatINRDetailed(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Compact labels for charts — ₹5.2L, ₹1.1Cr */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return formatINR(value);
}

export function parseINRInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  return Number(cleaned) || 0;
}

function trimDecimals(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

/** Human-readable Indian amount — e.g. 1 Cr, 50 Lakh, 5 Lakh */
export function formatINRLakhCrore(
  value: number,
  language: "en" | "hi" | "hinglish" = "en",
): string {
  if (value <= 0) return "";

  const crore = 1_00_00_000;
  const lakh = 1_00_000;

  if (value >= crore) {
    const amount = trimDecimals(value / crore);
    if (language === "hi") return `${amount} करोड़`;
    return `${amount} Cr`;
  }

  if (value >= lakh) {
    const amount = trimDecimals(value / lakh);
    if (language === "hi") return `${amount} लाख`;
    return `${amount} Lakh`;
  }

  if (value >= 1_000) {
    const amount = trimDecimals(value / 1_000);
    if (language === "hi") return `${amount} हज़ार`;
    return `${amount} Thousand`;
  }

  return formatINR(value);
}
