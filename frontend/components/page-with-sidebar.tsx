import { AdBottomRow, AdLeftPanel } from "@/components/ad-zones";

type PageWithSidebarProps = {
  children: React.ReactNode;
};

export function PageWithSidebar({ children }: PageWithSidebarProps) {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="order-2 xl:order-1">
        <AdLeftPanel />
      </div>
      <div className="order-1 min-w-0 flex-1 flex flex-col gap-8 xl:order-2">
        <div>{children}</div>
        <AdBottomRow />
      </div>
    </div>
  );
}
