import { PageWithSidebar } from "@/components/page-with-sidebar";
import { SiteHeader } from "@/components/site-header";

type SitePageLayoutProps = {
  children: React.ReactNode;
};

export function SitePageLayout({ children }: SitePageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageWithSidebar>{children}</PageWithSidebar>
      </main>
    </div>
  );
}
