"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ContributeDropdown } from "@/components/layout/ContributeDropdown";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteTopbar() {
  return (
    <header className="sticky top-0 z-50 flex h-11 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
        >
          <DagLogoIcon />
          DAGpedia
        </Link>
        <Badge variant="secondary">beta</Badge>
      </div>
      <ContributeDropdown />
    </header>
  );
}
