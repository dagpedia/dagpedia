"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ConditionalIndep } from "./ConditionalIndep";
import { EdgeList } from "./EdgeList";
import type { DagEdge, DagNode, EvidenceLevelLegendItem } from "@/types/dag";

export function EdgesAndConditionalIndep({
  edges,
  nodes,
  evidenceLegend,
  conditionalIndependencies,
  highlightedEdgeKey = null,
  onEdgeHover,
}: {
  edges: DagEdge[];
  nodes: DagNode[];
  evidenceLegend: EvidenceLevelLegendItem[];
  conditionalIndependencies: string[];
  highlightedEdgeKey?: string | null;
  onEdgeHover?: (edgeKey: string | null) => void;
}) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full min-h-0"
    >
      <ResizablePanel defaultSize="55%" minSize="28%">
        <EdgeList
          fill
          edges={edges}
          nodes={nodes}
          evidenceLegend={evidenceLegend}
          highlightedEdgeKey={highlightedEdgeKey}
          onEdgeHover={onEdgeHover}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="45%" minSize="22%">
        <ConditionalIndep fill items={conditionalIndependencies} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
