"use client";

import { DagTopbar } from "@/components/layout/DagTopbar";
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
    <>
      <DagTopbar
        title={title}
        nodeCount={nodeCount}
        edgeCount={edgeCount}
        tier={tier}
        dagType={dagType}
      />
      <div
        className="min-w-0 px-2 py-4 transition-[padding] duration-200 sm:px-3"
        style={{ paddingRight: open ? width : undefined }}
      >
        {children}
      </div>
      <DagittyPlainPanel code={dagittyCode} />
    </>
  );
}

export function DagPageShell(props: DagPageShellProps) {
  return (
    <DagittyPanelProvider>
      <DagPageShellContent {...props} />
    </DagittyPanelProvider>
  );
}
