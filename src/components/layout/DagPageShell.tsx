"use client";

import { DagTopbar } from "@/components/layout/DagTopbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  DagittyPanelProvider,
  useDagittyPanel,
} from "@/components/dag-display/DagittyPanelContext";
import { DagittyPlainPanel } from "@/components/dag-display/DagittyPlainPanel";
import type { DagTier, DagType } from "@/types/dag";

interface DagPageShellProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  tier: DagTier;
  dagType: DagType;
  dagittyCode: string;
  children: React.ReactNode;
}

function DagPageShellContent({
  title,
  nodeCount,
  edgeCount,
  tier,
  dagType,
  dagittyCode,
  children,
}: DagPageShellProps) {
  const { open, width } = useDagittyPanel();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DagTopbar
        title={title}
        nodeCount={nodeCount}
        edgeCount={edgeCount}
        tier={tier}
        dagType={dagType}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-1 py-2 transition-[padding] duration-200 sm:px-1.5"
        style={{ paddingRight: open ? width : undefined }}
      >
        {children}
        <SiteFooter />
      </div>
      <DagittyPlainPanel code={dagittyCode} />
    </div>
  );
}

export function DagPageShell(props: DagPageShellProps) {
  return (
    <DagittyPanelProvider>
      <DagPageShellContent {...props} />
    </DagittyPanelProvider>
  );
}
