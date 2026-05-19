"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DagittyCodePanel } from "@/components/dag-display/DagittyCodePanel";
import { TierBadge } from "@/components/dag-display/badges";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import type { DagTier } from "@/types/dag";

interface DagTopbarProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  tier: DagTier;
}

export function DagTopbar({ title, nodeCount, edgeCount, tier }: DagTopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-52 z-50 flex h-11 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          >
            <DagLogoIcon />
            DAGpedia
          </Link>
          <Badge variant="secondary">beta</Badge>
        </div>
        <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />
        <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {nodeCount} nodes · {edgeCount} edges
        </span>
        <TierBadge tier={tier} />
        <DagittyCodePanel />
      </div>
    </header>
  );
}
