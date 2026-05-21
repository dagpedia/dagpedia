"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DagittyCodePanel } from "@/components/dag-display/DagittyCodePanel";
import { DagTypeBadge, TierBadge } from "@/components/dag-display/badges";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { DagTier, DagType } from "@/types/dag";

interface DagTopbarProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  tier: DagTier;
  dagType: DagType;
}

export function DagTopbar({
  title,
  nodeCount,
  edgeCount,
  tier,
  dagType,
}: DagTopbarProps) {
  return (
    <header className="z-50 flex h-11 shrink-0 items-center justify-between gap-4 border-b bg-background px-3 lg:sticky lg:top-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          >
            <DagLogoIcon />
            <span className="hidden sm:inline">DAGpedia</span>
          </Link>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            beta
          </Badge>
        </div>
        <span
          className="hidden h-4 w-px shrink-0 bg-border lg:block"
          aria-hidden
        />
        <h1 className="hidden truncate text-sm font-semibold lg:block sm:text-base">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-muted-foreground lg:inline">
          {nodeCount} nodes · {edgeCount} edges
        </span>
        <div className="hidden items-center gap-2 lg:flex">
          <TierBadge tier={tier} />
          <DagTypeBadge dagType={dagType} />
        </div>
        <Button variant="outline" size="sm" type="button" disabled>
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <DagittyCodePanel />
      </div>
    </header>
  );
}
