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
  | "expert-opinion";

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

export interface AdjustmentSet {
  nodes: string[];
  estimand: string;
}

export interface DagContext {
  population: string;
  geographic: string;
  era: string;
  note?: string;
}

export interface AlternativeDag {
  slug: string;
  title: string;
  nodeCount: number;
  note: string;
}

export interface DagPageData {
  slug: string;
  body: string;
  id: string;
  title: string;
  exposure: string;
  outcome: string;
  context: DagContext;
  keywords: string[];
  mdCommitSha: string;
  deprecated?: boolean;
  supersededBy?: string;
  dagittyCode: string;
  alternativeDags: AlternativeDag[];
  nodes: DagNode[];
  edges: DagEdge[];
  adjustmentSets: AdjustmentSet[];
  conditionalIndependencies: string[];
}
