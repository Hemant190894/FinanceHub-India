import { AdBottomRow, AdLeftPanel } from "@/components/ad-zones";
import { getAdSlot } from "@/lib/ads/config";

type PageWithSidebarProps = {
  children: React.ReactNode;
};

export function PageWithSidebar({ children }: PageWithSidebarProps) {
  const hasLeftPanel = getAdSlot("leftPanel").enabled;

  if (!hasLeftPanel) {
    return (
      <div className="flex flex-col gap-8">
        {children}
        <AdBottomRow />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="xl:order-1">
        <AdLeftPanel />
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-8 xl:order-2">
        {children}
        <AdBottomRow />
      </div>
    </div>
  );
}
