"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { dagEdgeKey } from "@/lib/dag-edge-key";
import { PreserveViewportCenter } from "./PreserveViewportCenter";
import "@xyflow/react/dist/style.css";
import { Maximize2, Minimize2 } from "lucide-react";
import { CustomDagNode, type CustomDagNodeData } from "./CustomDagNode";
import { layoutDagElements } from "./layout-dag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DagEdge, DagNode } from "@/types/dag";

const nodeTypes = { dagNode: CustomDagNode };

interface DagCanvasProps {
  nodes: DagNode[];
  edges: DagEdge[];
  exposure: string;
  outcome: string;
  className?: string;
  highlightedEdgeKey?: string | null;
  highlightedNodeId?: string | null;
  onEdgeHover?: (edgeKey: string | null) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

const edgeStroke = "var(--muted-foreground)";

function toFlowEdge(edge: DagEdge, index: number, highlighted: boolean): Edge {
  return {
    id: `${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    animated: false,
    style: {
      stroke: edgeStroke,
      strokeWidth: highlighted ? 2.5 : 1.5,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edgeStroke,
      width: 20,
      height: 20,
    },
  };
}

function buildLayoutNodes(
  nodes: DagNode[],
  edges: DagEdge[]
): Node<CustomDagNodeData>[] {
  const useExplicitLayout =
    nodes.length > 0 && nodes.every((n) => n.position != null);

  const initial: Node<CustomDagNodeData>[] = nodes.map((node) => ({
    id: node.id,
    type: "dagNode",
    position: node.position ?? { x: 0, y: 0 },
    data: { label: node.label, role: node.role, highlighted: false },
  }));

  const flowEdges: Edge[] = edges.map((edge, index) =>
    toFlowEdge(edge, index, false)
  );

  return useExplicitLayout
    ? initial
    : layoutDagElements(initial, flowEdges);
}

function buildFlowEdges(
  edges: DagEdge[],
  highlightedEdgeKey: string | null | undefined
): Edge[] {
  return edges.map((edge, index) =>
    toFlowEdge(
      edge,
      index,
      highlightedEdgeKey === dagEdgeKey(edge.from, edge.to)
    )
  );
}

function DagCanvasInner({
  nodes,
  edges,
  className,
  highlightedEdgeKey,
  highlightedNodeId,
  onEdgeHover,
  onNodeHover,
}: DagCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "dark" ? "dark" : "light";

  const layoutNodes = useMemo(
    () => buildLayoutNodes(nodes, edges),
    [nodes, edges]
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(layoutNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(
    buildFlowEdges(edges, highlightedEdgeKey)
  );

  // Reset layout only when DAG structure changes — not on edge hover.
  useEffect(() => {
    setFlowNodes(layoutNodes);
    setFlowEdges(buildFlowEdges(edges, null));
  }, [layoutNodes, edges, setFlowNodes, setFlowEdges]);

  useEffect(() => {
    setFlowEdges(buildFlowEdges(edges, highlightedEdgeKey));
  }, [highlightedEdgeKey, edges, setFlowEdges]);

  useEffect(() => {
    setFlowNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: n.id === highlightedNodeId,
        },
      }))
    );
  }, [highlightedNodeId, setFlowNodes]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const onInit = useCallback(
    (instance: ReactFlowInstance<Node<CustomDagNodeData>, Edge>) => {
      void instance.fitView({ padding: 0.2 });
    },
    []
  );

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  }, []);

  const showMiniMap = nodes.length > 15;

  return (
    <div
      ref={containerRef}
      className={cn(
        "dag-canvas-container relative h-full w-full border bg-muted ring-1 ring-foreground/10",
        isFullscreen && "rounded-none border-0 bg-background ring-0",
        className
      )}
    >
      <ReactFlow
        colorMode={flowColorMode}
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        onEdgeMouseEnter={(_event, edge) => {
          onEdgeHover?.(dagEdgeKey(edge.source, edge.target));
        }}
        onEdgeMouseLeave={() => {
          onEdgeHover?.(null);
        }}
        onNodeMouseEnter={(_event, node) => {
          onNodeHover?.(node.id);
        }}
        onNodeMouseLeave={() => {
          onNodeHover?.(null);
        }}
      >
        <PreserveViewportCenter containerRef={containerRef} />
        <Background gap={16} color="var(--border)" />
        <Controls showInteractive={false} />
        {showMiniMap && <MiniMap pannable zoomable />}
        <Panel position="top-right" className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="bg-card/90 shadow-sm backdrop-blur-sm"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </Panel>
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
