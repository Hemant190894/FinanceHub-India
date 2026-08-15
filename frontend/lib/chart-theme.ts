export const CHART_BOTTOM_MARGIN = 56;

export function getChartTheme(isDark: boolean) {
  return {
    gridColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    axisColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)",
  };
}
