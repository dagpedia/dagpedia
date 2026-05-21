"use client";

import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sortDagNodes } from "@/lib/sort-dag-nodes";
import { cn } from "@/lib/utils";
import { PanelCard } from "./PanelCard";
import { RoleBadge } from "./badges";
import type { DagNode } from "@/types/dag";

export function NodeList({
  nodes,
  exposureId,
  outcomeId,
  highlightedNodeId = null,
  onNodeHover,
  divided = false,
  fill = false,
}: {
  nodes: DagNode[];
  exposureId: string;
  outcomeId: string;
  highlightedNodeId?: string | null;
  onNodeHover?: (nodeId: string | null) => void;
  divided?: boolean;
  fill?: boolean;
}) {
  const sorted = sortDagNodes(nodes, exposureId, outcomeId);

  return (
    <PanelCard title={`Nodes (${sorted.length})`} divided={divided} fill={fill}>
      <ScrollArea className={cn(fill && "h-full min-h-0 flex-1")}>
        <ul className="space-y-2.5 pr-1">
          {sorted.map((node) => (
            <li
              key={node.id}
              data-node-id={node.id}
              onMouseEnter={() => onNodeHover?.(node.id)}
              onMouseLeave={() => onNodeHover?.(null)}
              className={cn(
                "space-y-1 rounded-md border-2 px-1 py-1 transition-colors",
                highlightedNodeId === node.id
                  ? "border-foreground bg-muted/60"
                  : "border-transparent"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{node.label}</span>
                <RoleBadge role={node.role} />
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={(node.centrality ?? 0) * 100}
                  className="h-1.5 flex-1"
                  aria-label={`Centrality ${(node.centrality ?? 0).toFixed(2)}`}
                />
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {(node.centrality ?? 0).toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </PanelCard>
  );
}
