"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SiteTopbar } from "@/components/layout/SiteTopbar";
import { isDagDetailPage } from "@/lib/nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dagDetail = isDagDetailPage(pathname);

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "13rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className={cn("min-w-0 bg-background", dagDetail && "flex flex-col")}>
        {dagDetail ? (
          children
        ) : (
          <>
            <SiteTopbar />
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
