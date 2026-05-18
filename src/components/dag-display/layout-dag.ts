import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { CustomDagNodeData } from "./CustomDagNode";

export function layoutDagElements(
  nodes: Node<CustomDagNodeData>[],
  edges: Edge[]
): Node<CustomDagNodeData>[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 48, ranksep: 72 });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: 140, height: 48 });
  });
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - 70,
        y: position.y - 24,
      },
    };
  });
}
