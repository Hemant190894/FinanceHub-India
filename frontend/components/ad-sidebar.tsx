import { AdSlot } from "@/components/ad-slot";
import { getAdSlot } from "@/lib/ads/config";

export function AdSidebar() {
  const top = getAdSlot("sidebarTop");
  const bottom = getAdSlot("sidebarBottom");
  const showBottom = bottom.enabled;

  if (!top.enabled && !bottom.enabled) return null;

  return (
    <aside className="space-y-4" aria-label="Advertisement">
      {top.enabled && <AdSlot slot="sidebarTop" />}
      {showBottom && <AdSlot slot="sidebarBottom" />}
    </aside>
  );
}
