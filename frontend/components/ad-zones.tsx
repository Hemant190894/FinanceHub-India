import { AdSlot } from "@/components/ad-slot";
import { getAdSlot } from "@/lib/ads/config";

export function AdBottomRow() {
  const left = getAdSlot("bottomLeft");
  const right = getAdSlot("bottomRight");

  if (!left.enabled && !right.enabled) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Advertisement">
      {left.enabled && <AdSlot slot="bottomLeft" />}
      {right.enabled && <AdSlot slot="bottomRight" />}
    </div>
  );
}

export function AdLeftPanel() {
  const panel = getAdSlot("leftPanel");
  if (!panel.enabled) return null;

  return (
    <aside className="flex h-full w-full min-h-[240px] flex-1" aria-label="Advertisement">
      <AdSlot slot="leftPanel" variant="panel" className="h-full flex-1" />
    </aside>
  );
}
