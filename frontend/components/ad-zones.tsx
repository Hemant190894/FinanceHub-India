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
    <aside className="w-full xl:w-80 shrink-0" aria-label="Advertisement">
      <div className="xl:sticky xl:top-20">
        <AdSlot slot="leftPanel" variant="panel" />
      </div>
    </aside>
  );
}
