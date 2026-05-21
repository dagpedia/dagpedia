"use client";

import { DagTopbar } from "@/components/layout/DagTopbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  DagittyPanelProvider,
  useDagittyPanel,
} from "@/components/dag-display/DagittyPanelContext";
import { DagittyPlainPanel } from "@/components/dag-display/DagittyPlainPanel";
import { useIsLgUp } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
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
  const isDesktop = useIsLgUp();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <DagTopbar
        title={title}
        nodeCount={nodeCount}
        edgeCount={edgeCount}
        tier={tier}
        dagType={dagType}
      />
      {!isDesktop && (
        <div className="shrink-0 border-b bg-background px-3 py-2.5">
          <h1 className="truncate text-base font-semibold leading-tight">
            {title}
          </h1>
        </div>
      )}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-200",
          isDesktop
            ? "overflow-y-auto px-1 py-2 sm:px-1.5"
            : "overflow-hidden px-1 pb-2 pt-2 sm:px-1.5"
        )}
        style={{ paddingRight: open ? width : undefined }}
      >
        {children}
        {isDesktop && <SiteFooter />}
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
