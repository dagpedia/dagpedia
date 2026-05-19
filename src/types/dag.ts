export type NodeRole =
  | "exposure"
  | "outcome"
  | "mediator"
  | "covariate"
  | "instrument"
  | "collider";

export type EvidenceLevel = "strong" | "moderate" | "weak" | "assumed";

export type DagTier = "verified" | "reviewed" | "community";

export type DagType = "domain-level" | "study-specific";

export type WorkflowStatus = "draft" | "under-review" | "ratified";

export interface DagNode {
  id: string;
  label: string;
  role: NodeRole;
  centrality?: number;
  /** Present when dagitty source defines layout for all nodes */
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

export interface DagAuthor {
  name: string;
  affiliation?: string;
  orcid?: string;
}

export interface DagContributor {
  name: string;
  affiliation?: string;
  initials: string;
}

export interface DagReference {
  doi?: string;
  pmid?: string;
  citation: string;
}

export interface AlternativeDag {
  slug: string;
  title: string;
  nodeCount: number;
  note: string;
}

export interface DagMeta {
  id: string;
  title: string;
  exposure: string;
  outcome: string;
  tier: DagTier;
  dagType: DagType;
  workflowStatus: WorkflowStatus;
  version: string;
  updatedAt: string;
  authors: DagAuthor[];
  contributors: DagContributor[];
  tags: string[];
  references: DagReference[];
  dagittyCode: string;
  alternativeDags: AlternativeDag[];
}

export interface DagPageData extends DagMeta {
  slug: string;
  body: string;
  nodes: DagNode[];
  edges: DagEdge[];
  adjustmentSets: AdjustmentSet[];
  conditionalIndependencies: string[];
}
