"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelCard } from "./PanelCard";
import { RoleBadge } from "./badges";
import type { DagNode } from "@/types/dag";

export function NodeList({ nodes }: { nodes: DagNode[] }) {
  const sorted = [...nodes].sort(
    (a, b) => (b.centrality ?? 0) - (a.centrality ?? 0)
  );

  return (
    <PanelCard title="Nodes">
      <ScrollArea className="h-[200px] pr-2">
        <ul className="space-y-2.5">
          {sorted.map((node) => (
            <li key={node.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium">
                  {node.label}
                </span>
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
      </ScrollArea>
    </PanelCard>
  );
}
