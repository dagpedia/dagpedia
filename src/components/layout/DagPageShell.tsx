"use client";

import { DagMetaBar } from "@/components/layout/DagMetaBar";
import { DagTopbar } from "@/components/layout/DagTopbar";
import {
  DagittyPanelProvider,
  useDagittyPanel,
} from "@/components/dag-display/DagittyPanelContext";
import { DagittyPlainPanel } from "@/components/dag-display/DagittyPlainPanel";
import { useIsLgUp } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface DagPageShellProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  slug: string;
  mdCommitSha: string;
  deprecated?: boolean;
  dagittyCode: string;
  children: React.ReactNode;
}

function DagPageShellContent({
  title,
  nodeCount,
  edgeCount,
  slug,
  mdCommitSha,
  deprecated,
  dagittyCode,
  children,
}: DagPageShellProps) {
  const { open, width } = useDagittyPanel();
  const isDesktop = useIsLgUp();

  return (
    <div className="dag-page-shell grid h-full min-h-0 flex-1 grid-rows-[auto_auto_1fr]">
      <DagTopbar />
      <div className="shrink-0 px-1 pt-2 pb-2 sm:px-1.5">
        <DagMetaBar
          title={title}
          nodeCount={nodeCount}
          edgeCount={edgeCount}
          slug={slug}
          mdCommitSha={mdCommitSha}
          deprecated={deprecated}
        />
      </div>
      <div
        className={cn(
          "dag-content-area flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-200",
          isDesktop
            ? "overflow-hidden px-1 pb-2 sm:px-1.5"
            : "min-h-0 overflow-hidden px-1 pb-2 sm:px-1.5"
        )}
        style={{ paddingRight: open ? width : undefined }}
      >
        <div
          className={cn(
            "dag-content-scroll flex min-h-0 flex-1 flex-col",
            isDesktop
              ? "overflow-y-auto overscroll-contain"
              : "overflow-hidden"
          )}
        >
          {children}
        </div>
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
