"use client";

import { usePathname } from "next/navigation";
import { isDagDetailPage } from "@/lib/nav";

export default function DagsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isDagDetailPage(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
