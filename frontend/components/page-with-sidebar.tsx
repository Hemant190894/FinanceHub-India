import { AdSidebar } from "@/components/ad-sidebar";

type PageWithSidebarProps = {
  children: React.ReactNode;
};

export function PageWithSidebar({ children }: PageWithSidebarProps) {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="w-full shrink-0 xl:w-72">
        <div className="xl:sticky xl:top-20">
          <AdSidebar />
        </div>
      </div>
    </div>
  );
}
