export const CHART_BOTTOM_MARGIN = 56;

/** Mirrors the --chart-1..5 tokens in globals.css — kept as hex here because
 * Recharts SVG fills don't reliably resolve CSS custom properties. */
export function getChartTheme(isDark: boolean) {
  return {
    gridColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    axisColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)",
    principal: isDark ? "#34d399" : "#059669",
    principalSoft: isDark ? "#6ee7b7" : "#34d399",
    interest: isDark ? "#fbbf24" : "#d97706",
    interestSoft: isDark ? "#fcd34d" : "#f59e0b",
    violet: isDark ? "#a78bfa" : "#7c3aed",
    blue: isDark ? "#60a5fa" : "#2563eb",
  };
}
