"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteTopbar } from "@/components/layout/SiteTopbar";
import { isDagDetailPage } from "@/lib/nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dagDetail = isDagDetailPage(pathname);
  const isDagsList = pathname === "/dags";

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "13rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset
        className={cn(
          "min-w-0 bg-background",
          dagDetail && "flex flex-col overflow-hidden lg:h-svh lg:max-h-svh"
        )}
      >
        {dagDetail ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          <>
            <SiteTopbar />
            <div
              className={cn(
                "flex w-full min-w-0 flex-1 flex-col px-4 py-8",
                !isDagsList && "mx-auto max-w-7xl"
              )}
            >
              {children}
              <SiteFooter />
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
