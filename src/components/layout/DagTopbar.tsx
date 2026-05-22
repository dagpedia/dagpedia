"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DagittyCodePanel } from "@/components/dag-display/DagittyCodePanel";
import { DagpediaBetaBadge } from "@/components/layout/DagpediaBetaBadge";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import { DagpediaLogoText } from "@/components/layout/DagpediaLogoText";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DagTopbar() {
  return (
    <header className="z-50 flex h-11 shrink-0 items-center justify-between gap-4 border-b bg-background px-3 lg:sticky lg:top-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger />
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-1.5 hover:opacity-80 sm:gap-2"
          >
            <DagLogoIcon />
            <DagpediaLogoText className="truncate" />
          </Link>
          <DagpediaBetaBadge className="shrink-0" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button variant="outline" size="sm" type="button" disabled>
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <DagittyCodePanel />
      </div>
    </header>
  );
}
