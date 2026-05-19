"use client";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sortDagNodes } from "@/lib/sort-dag-nodes";
import { cn } from "@/lib/utils";
import { PanelCard } from "./PanelCard";
import { RoleBadge } from "./badges";
import type { DagNode } from "@/types/dag";

const ROW_HEIGHT = 48;
const PANEL_PADDING = 32;
const MIN_HEIGHT = 72;
const MAX_HEIGHT = 420;

function nodesPanelHeight(count: number) {
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, count * ROW_HEIGHT + PANEL_PADDING));
}

export function NodeList({
  nodes,
  exposureId,
  outcomeId,
  highlightedNodeId = null,
}: {
  nodes: DagNode[];
  exposureId: string;
  outcomeId: string;
  highlightedNodeId?: string | null;
}) {
  const sorted = sortDagNodes(nodes, exposureId, outcomeId);
  const height = nodesPanelHeight(sorted.length);
  const scrollable = height >= MAX_HEIGHT;

  return (
    <PanelCard title={`Nodes (${sorted.length})`}>
      <ul
        className={scrollable ? "space-y-2.5 overflow-y-auto pr-1" : "space-y-2.5"}
        style={{ height, maxHeight: MAX_HEIGHT }}
      >
        {sorted.map((node) => (
          <li
            key={node.id}
            data-node-id={node.id}
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
            <Tooltip>
              <TooltipTrigger className="block w-full">
                <Progress
                  value={(node.centrality ?? 0) * 100}
                  className="h-[3px] w-9"
                />
              </TooltipTrigger>
              <TooltipContent>
                Centrality: {(node.centrality ?? 0).toFixed(2)}
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
