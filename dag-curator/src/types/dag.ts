/**
 * DAG type definitions — mirrors dagpedia/src/types/dag.ts
 * Keep in sync with the dagpedia schema.
 */

export type NodeRole =
  | "exposure"
  | "outcome"
  | "mediator"
  | "covariate"
  | "instrument"
  | "collider";

export type EvidenceLevel =
  | "strong"
  | "moderate"
  | "weak"
  | "conflicting"
  | "expert-opinion"
  | "unknown";

export const EVIDENCE_LEVELS: EvidenceLevel[] = [
  "strong",
  "moderate",
  "weak",
  "conflicting",
  "expert-opinion",
  "unknown",
];

export interface DagNode {
  id: string;
  label: string;
  role: NodeRole;
  centrality?: number;
  position?: { x: number; y: number };
}

export interface DagEdge {
  from: string;
  to: string;
  evidence: EvidenceLevel;
  notes?: string;
}

export interface DagContext {
  population: string;
  geographic: string;
  era: string;
  note?: string;
}

/** The canonical dagpedia DAG frontmatter structure */
export interface DagFrontmatter {
  id: string;
  title: string;
  context: DagContext;
  dagitty: string;
  evidence: Record<string, EvidenceLevel>; // "from -> to": level
  keywords: string[];
  alternatives?: string[];
}
