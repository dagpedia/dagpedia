import type { NodeRole } from "@/types/dag";
import type { DagittyGraph, DagittyRuntime, DagittyVertex } from "./types";

/** dagitty layout units → React Flow pixels */
export const LAYOUT_SCALE = 120;

const ROLE_TAGS: Record<string, NodeRole> = {
  exposure: "exposure",
  outcome: "outcome",
  mediator: "mediator",
  covariate: "covariate",
  instrument: "instrument",
  collider: "collider",
};

export interface DagittyNodeInfo {
  role?: NodeRole;
  x?: number;
  y?: number;
}

export interface DagittyStructure {
  nodes: Map<string, DagittyNodeInfo>;
  edges: { from: string; to: string }[];
  hasExplicitLayout: boolean;
}

export function parseDagittyGraph(
  code: string,
  runtime: DagittyRuntime
): DagittyGraph {
  const graph = runtime.GraphParser.parseGuess(code);
  graph.setType?.("dag");
  return graph;
}

function roleFromVertex(v: DagittyVertex, graph: DagittyGraph): NodeRole | undefined {
  if (graph.isSource?.(v)) return "exposure";
  if (graph.isTarget?.(v)) return "outcome";
  for (const prop of v.properties ?? []) {
    const mapped = ROLE_TAGS[prop.toLowerCase()];
    if (mapped) return mapped;
  }
  return undefined;
}

function hasLayout(v: DagittyVertex): boolean {
  return v.layout_pos_x !== undefined && v.layout_pos_y !== undefined;
}

/** Directed parent → child edges for React Flow. */
function collectDirectedEdges(graph: DagittyGraph): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  const seen = new Set<string>();

  for (const e of graph.getEdges()) {
    const directed = e.directed;
    // Graph.Edgetype.Directed === 1 in dagitty.js
    if (directed === 1 || directed === undefined) {
      const key = `${e.v1.id}->${e.v2.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ from: e.v1.id, to: e.v2.id });
      }
    } else if (directed === 2) {
      // Bidirected: represent as two directed edges for display
      for (const [from, to] of [
        [e.v1.id, e.v2.id],
        [e.v2.id, e.v1.id],
      ] as const) {
        const key = `${from}->${to}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from, to });
        }
      }
    }
  }

  return edges;
}

export function dagittyToStructure(graph: DagittyGraph): DagittyStructure {
  const vertices = graph.getVertices();
  const nodes = new Map<string, DagittyNodeInfo>();
  const allHaveLayout =
    vertices.length > 0 && vertices.every((v) => hasLayout(v));

  for (const v of vertices) {
    const info: DagittyNodeInfo = {
      role: roleFromVertex(v, graph),
    };
    if (allHaveLayout && hasLayout(v)) {
      info.x = v.layout_pos_x! * LAYOUT_SCALE;
      info.y = v.layout_pos_y! * LAYOUT_SCALE;
    }
    nodes.set(v.id, info);
  }

  return {
    nodes,
    edges: collectDirectedEdges(graph),
    hasExplicitLayout: allHaveLayout,
  };
}

export function parseDagittyStructureFromCode(
  code: string,
  runtime: DagittyRuntime
): DagittyStructure {
  const graph = parseDagittyGraph(code, runtime);
  return dagittyToStructure(graph);
}
