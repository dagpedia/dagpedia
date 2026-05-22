import { DagTypeBadge } from "@/components/dag-display/badges";
import { VersionPopover } from "@/components/dag-display/VersionPopover";
import type { DagContributor, DagType, WorkflowStatus } from "@/types/dag";

interface DagMetaBarProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  dagType: DagType;
  version: string;
  updatedAt: string;
  workflowStatus: WorkflowStatus;
  slug: string;
  contributors: DagContributor[];
}

export function DagMetaBar({
  title,
  nodeCount,
  edgeCount,
  dagType,
  version,
  updatedAt,
  workflowStatus,
  slug,
  contributors,
}: DagMetaBarProps) {
  return (
    <div className="box-border flex h-11 shrink-0 items-center gap-2 rounded-xl border bg-card px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="min-w-0 truncate text-base font-semibold leading-tight">
          {title}
        </h1>
        <VersionPopover
          version={version}
          updatedAt={updatedAt}
          status={workflowStatus}
          slug={slug}
          contributors={contributors}
        />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {nodeCount} nodes · {edgeCount} edges
        </span>
        <span className="text-sm text-muted-foreground sm:hidden">
          {nodeCount}n · {edgeCount}e
        </span>
        <DagTypeBadge dagType={dagType} />
      </div>
    </div>
  );
}
