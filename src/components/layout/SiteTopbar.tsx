"use client";

import Link from "next/link";
import { ContributeDropdown } from "@/components/layout/ContributeDropdown";
import { DagpediaBetaBadge } from "@/components/layout/DagpediaBetaBadge";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import { DagpediaLogoText } from "@/components/layout/DagpediaLogoText";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteTopbar() {
  return (
    <header className="sticky top-0 z-50 flex h-11 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80"
        >
          <DagLogoIcon />
          <DagpediaLogoText />
        </Link>
        <DagpediaBetaBadge />
      </div>
      <ContributeDropdown />
    </header>
  );
}
