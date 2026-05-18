"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomDagNode, type CustomDagNodeData } from "./CustomDagNode";
import { layoutDagElements } from "./layout-dag";
import { cn } from "@/lib/utils";
import type { DagEdge, DagNode } from "@/types/dag";

const nodeTypes = { dagNode: CustomDagNode };

interface DagCanvasProps {
  nodes: DagNode[];
  edges: DagEdge[];
  exposure: string;
  outcome: string;
  className?: string;
}

function DagCanvasInner({ nodes, edges, className }: DagCanvasProps) {
  const flowNodes = useMemo(() => {
    const initial: Node<CustomDagNodeData>[] = nodes.map((node) => ({
      id: node.id,
      type: "dagNode",
      position: { x: 0, y: 0 },
      data: { label: node.label, role: node.role },
    }));

    const flowEdges: Edge[] = edges.map((edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      animated: false,
      style: { stroke: "hsl(var(--muted-foreground))" },
    }));

    return {
      nodes: layoutDagElements(initial, flowEdges),
      edges: flowEdges,
    };
  }, [nodes, edges]);

  const showMiniMap = nodes.length > 15;

  return (
    <div
      className={cn(
        "h-full w-full rounded-xl border bg-muted ring-1 ring-foreground/10",
        className
      )}
    >
      <ReactFlow
        nodes={flowNodes.nodes}
        edges={flowNodes.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="hsl(var(--border))" />
        <Controls showInteractive={false} />
        {showMiniMap && <MiniMap pannable zoomable />}
      </ReactFlow>
    </div>
  );
}

export function DagCanvas(props: DagCanvasProps) {
  return (
    <ReactFlowProvider>
      <DagCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
