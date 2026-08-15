import { PageWithSidebar } from "@/components/page-with-sidebar";
import { SiteHeader } from "@/components/site-header";

type SitePageLayoutProps = {
  children: React.ReactNode;
};

export function SitePageLayout({ children }: SitePageLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-background to-background dark:from-primary/10">
      <SiteHeader />
      <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
        <PageWithSidebar>{children}</PageWithSidebar>
      </main>
    </div>
  );
}
