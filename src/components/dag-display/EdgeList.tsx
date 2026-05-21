"use client";

import { dagEdgeKey } from "@/lib/dag-edge-key";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EvidenceBadge } from "./badges";
import { EvidenceLegendContent } from "./EvidenceLegend";
import { PanelCard } from "./PanelCard";
import type { DagEdge, DagNode } from "@/types/dag";

export function EdgeList({
  edges,
  nodes,
  highlightedEdgeKey = null,
  onEdgeHover,
  divided = false,
  bare = false,
}: {
  edges: DagEdge[];
  nodes: DagNode[];
  highlightedEdgeKey?: string | null;
  onEdgeHover?: (edgeKey: string | null) => void;
  divided?: boolean;
  bare?: boolean;
}) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <PanelCard title="Edges" divided={divided} bare={bare}>
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_20px_1fr_80px] gap-x-2 border-b px-1 pb-2 text-sm">
          <span className="font-medium text-muted-foreground">From</span>
          <span />
          <span className="font-medium text-muted-foreground">To</span>
          <Tooltip>
            <TooltipTrigger
              className="w-fit cursor-help font-medium text-muted-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
              aria-label="Evidence levels"
            >
              Evidence
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="end"
              className="max-w-xs bg-popover px-3 py-2 text-popover-foreground"
            >
              <EvidenceLegendContent />
            </TooltipContent>
          </Tooltip>
        </div>
        {edges.map((edge) => {
          const key = dagEdgeKey(edge.from, edge.to);
          return (
            <EdgeRow
              key={key}
              edge={edge}
              label={label}
              highlighted={highlightedEdgeKey === key}
              onHover={onEdgeHover}
            />
          );
        })}
      </div>
    </PanelCard>
  );
}

function EdgeRow({
  edge,
  label,
  highlighted,
  onHover,
}: {
  edge: DagEdge;
  label: (id: string) => string;
  highlighted: boolean;
  onHover?: (edgeKey: string | null) => void;
}) {
  const key = dagEdgeKey(edge.from, edge.to);
  return (
    <div
      data-edge-key={key}
      onMouseEnter={() => onHover?.(key)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "grid grid-cols-[1fr_20px_1fr_80px] gap-x-2 rounded-md border-2 px-1 py-1 text-sm transition-colors",
        highlighted
          ? "border-foreground bg-muted/60"
          : "border-transparent"
      )}
    >
      <span>{label(edge.from)}</span>
      <span className="text-center text-muted-foreground" aria-hidden>
        →
      </span>
      <span>{label(edge.to)}</span>
      <span>
        <EvidenceBadge level={edge.evidence} />
      </span>
    </div>
  );
}
