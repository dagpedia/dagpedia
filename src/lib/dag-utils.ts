import type { DagEdge, DagNode, EvidenceLevel, NodeRole } from "@/types/dag";
import { getNodeLabel } from "./nodes";

const ROLE_TAGS: Record<string, NodeRole> = {
  exposure: "exposure",
  outcome: "outcome",
  mediator: "mediator",
  covariate: "covariate",
  instrument: "instrument",
  collider: "collider",
};

export interface ParsedDagStructure {
  nodes: Map<string, NodeRole | undefined>;
  edges: { from: string; to: string }[];
}

export function parseDagittyStructure(code: string): ParsedDagStructure {
  const nodes = new Map<string, NodeRole | undefined>();
  const edges: { from: string; to: string }[] = [];

  const inner = code
    .trim()
    .replace(/^dag\s*\{/i, "")
    .replace(/\}\s*$/i, "")
    .trim();

  for (const rawLine of inner.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;

    const edgeMatch = line.match(/^([\w-]+)\s*->\s*([\w-]+)/);
    if (edgeMatch) {
      const [, from, to] = edgeMatch;
      edges.push({ from, to });
      if (!nodes.has(from)) nodes.set(from, undefined);
      if (!nodes.has(to)) nodes.set(to, undefined);
      continue;
    }

    const nodeMatch = line.match(/^([\w-]+)(.*)$/);
    if (!nodeMatch) continue;

    const [, id, rest] = nodeMatch;
    let role: NodeRole | undefined;
    const tags = rest.matchAll(/\[([\w-]+)\]/g);
    for (const tag of tags) {
      const mapped = ROLE_TAGS[tag[1].toLowerCase()];
      if (mapped) role = mapped;
    }
    nodes.set(id, role ?? nodes.get(id));
  }

  return { nodes, edges };
}

export function inferNodeRoles(
  structure: ParsedDagStructure,
  exposure: string,
  outcome: string
): Map<string, NodeRole> {
  const roles = new Map<string, NodeRole>();
  const { nodes, edges } = structure;

  for (const [id, tagged] of nodes) {
    if (tagged) roles.set(id, tagged);
  }

  roles.set(exposure, "exposure");
  roles.set(outcome, "outcome");

  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const { from, to } of edges) {
    if (!children.has(from)) children.set(from, []);
    children.get(from)!.push(to);
    if (!parents.has(to)) parents.set(to, []);
    parents.get(to)!.push(from);
  }

  const onExposureToOutcomePath = new Set<string>();
  const queue = [exposure];
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    onExposureToOutcomePath.add(id);
    for (const child of children.get(id) ?? []) {
      if (child === outcome || !visited.has(child)) queue.push(child);
    }
  }

  for (const id of nodes.keys()) {
    if (roles.has(id)) continue;
    if (id === exposure || id === outcome) continue;

    const isMediator =
      (parents.get(id) ?? []).some((p) => onExposureToOutcomePath.has(p)) &&
      (children.get(id) ?? []).some((c) => c === outcome || onExposureToOutcomePath.has(c));

    roles.set(id, isMediator ? "mediator" : "covariate");
  }

  return roles;
}

export function buildDagNodes(
  structure: ParsedDagStructure,
  exposure: string,
  outcome: string,
  centrality: Map<string, number>
): DagNode[] {
  const roles = inferNodeRoles(structure, exposure, outcome);
  return [...structure.nodes.keys()].map((id) => ({
    id,
    label: getNodeLabel(id),
    role: roles.get(id) ?? "covariate",
    centrality: centrality.get(id),
  }));
}

export function buildDagEdges(
  structure: ParsedDagStructure,
  defaultEvidence: EvidenceLevel
): DagEdge[] {
  return structure.edges.map(({ from, to }) => ({
    from,
    to,
    evidence: defaultEvidence,
  }));
}

export function mapLegacyEvidence(
  level?: string
): EvidenceLevel {
  switch (level) {
    case "strong":
      return "strong";
    case "moderate":
      return "moderate";
    case "theoretical":
      return "assumed";
    case "limited":
    default:
      return "weak";
  }
}

export function inferTier(evidence?: string): import("@/types/dag").DagTier {
  switch (evidence) {
    case "strong":
      return "verified";
    case "moderate":
      return "reviewed";
    default:
      return "community";
  }
}
