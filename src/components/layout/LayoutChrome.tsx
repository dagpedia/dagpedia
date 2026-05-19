"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { isDagDetailPage } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dagDetail = isDagDetailPage(pathname);

  return (
    <>
      {!dagDetail && <Topbar />}
      <main
        className={cn(
          "mx-auto max-w-7xl px-4 py-8",
          dagDetail ? "max-w-none p-0" : "pt-13"
        )}
      >
        {children}
      </main>
    </>
  );
}
