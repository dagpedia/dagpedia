"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { dagEdgeKey } from "@/lib/dag-edge-key";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EvidenceBadge } from "./badges";
import { EvidenceLegendContent } from "./EvidenceLegend";
import {
  panelListBodyClass,
  panelListHeaderClass,
  panelListRowClass,
} from "./panel-list-styles";
import { PanelCard } from "./PanelCard";
import type {
  DagEdge,
  DagNode,
  EvidenceLevel,
  EvidenceLevelLegendItem,
} from "@/types/dag";

export function EdgeList({
  edges,
  nodes,
  evidenceLegend,
  highlightedEdgeKey = null,
  onEdgeHover,
  divided = false,
  fill = false,
  bare = false,
}: {
  edges: DagEdge[];
  nodes: DagNode[];
  evidenceLegend: EvidenceLevelLegendItem[];
  highlightedEdgeKey?: string | null;
  onEdgeHover?: (edgeKey: string | null) => void;
  divided?: boolean;
  fill?: boolean;
  bare?: boolean;
}) {
  const nodeLabel = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  const evidenceLabelByLevel = new Map(
    evidenceLegend.map((item) => [item.level, item.label])
  );
  const evidenceLabel = (level: EvidenceLevel) =>
    evidenceLabelByLevel.get(level) ?? level;
  const table = (
    <div className={panelListBodyClass}>
      <div
        className={cn(
          "grid grid-cols-[1fr_20px_1fr_80px] items-center gap-x-2",
          panelListHeaderClass
        )}
      >
        <span>From</span>
        <span />
        <span>To</span>
        <Tooltip>
          <TooltipTrigger
            className="w-fit cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
            aria-label="Evidence levels"
          >
            Evidence
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="end"
            className="max-w-xs bg-popover px-3 py-2 text-popover-foreground"
          >
            <EvidenceLegendContent levels={evidenceLegend} />
          </TooltipContent>
        </Tooltip>
      </div>
      {edges.map((edge) => {
        const key = dagEdgeKey(edge.from, edge.to);
        return (
          <EdgeRow
            key={key}
            edge={edge}
            nodeLabel={nodeLabel}
            evidenceLabel={evidenceLabel}
            highlighted={highlightedEdgeKey === key}
            onHover={onEdgeHover}
          />
        );
      })}
    </div>
  );

  return (
    <PanelCard title="Edges" divided={divided} fill={fill && !bare} bare={bare}>
      {fill && !bare ? (
        <ScrollArea className="h-full min-h-0 flex-1">{table}</ScrollArea>
      ) : (
        table
      )}
    </PanelCard>
  );
}

function EdgeRow({
  edge,
  nodeLabel,
  evidenceLabel,
  highlighted,
  onHover,
}: {
  edge: DagEdge;
  nodeLabel: (id: string) => string;
  evidenceLabel: (level: EvidenceLevel) => string;
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
        "grid grid-cols-[1fr_20px_1fr_80px] items-center gap-x-2 transition-colors",
        panelListRowClass(highlighted)
      )}
    >
      <span>{nodeLabel(edge.from)}</span>
      <span className="text-center text-muted-foreground" aria-hidden>
        →
      </span>
      <span>{nodeLabel(edge.to)}</span>
      <span>
        <EvidenceBadge level={edge.evidence} label={evidenceLabel(edge.evidence)} />
      </span>
    </div>
  );
}
