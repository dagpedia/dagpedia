import type { DagProvenance } from "@/lib/provenance";

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

export type EvidenceLevelLegendItem = {
  level: EvidenceLevel;
  label: string;
  description: string;
};

/** Vocabulary id stored in content; label resolved from docs/schema/enums. */
export type LabeledSlug = {
  id: string;
  label: string;
};

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

/** Context with display labels resolved from docs/schema/enums/context.yaml */
export interface DagContextDisplay {
  population: LabeledSlug;
  geographic: LabeledSlug;
  era: LabeledSlug;
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
  context: DagContextDisplay;
  keywords: LabeledSlug[];
  provenance: DagProvenance;
  deprecated?: boolean;
  supersededBy?: string;
  dagittyCode: string;
  alternativeDags: AlternativeDag[];
  nodes: DagNode[];
  edges: DagEdge[];
  adjustmentSets: AdjustmentSet[];
  conditionalIndependencies: string[];
  evidenceLegend: EvidenceLevelLegendItem[];
}
