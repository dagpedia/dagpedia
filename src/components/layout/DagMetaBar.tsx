import { VersionPopover } from "@/components/dag-display/VersionPopover";

interface DagMetaBarProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  slug: string;
  mdCommitSha: string;
  deprecated?: boolean;
}

export function DagMetaBar({
  title,
  nodeCount,
  edgeCount,
  slug,
  mdCommitSha,
  deprecated,
}: DagMetaBarProps) {
  return (
    <div className="box-border flex h-11 shrink-0 items-center gap-2 rounded-xl border bg-card px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="min-w-0 truncate text-base font-semibold leading-tight">
          {title}
        </h1>
        {deprecated && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            Deprecated
          </span>
        )}
        <VersionPopover mdCommitSha={mdCommitSha} slug={slug} />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {nodeCount} nodes · {edgeCount} edges
        </span>
        <span className="text-sm text-muted-foreground sm:hidden">
          {nodeCount}n · {edgeCount}e
        </span>
      </div>
    </div>
  );
}
