export interface DagFrontmatter {
  id: string;
  title: string;
  exposure: string;
  outcome: string;
  nodes: DagNodeRef[];
  evidence_level: EvidenceLevel;
  references?: Reference[];
  related_dags?: string[];
  tags?: string[];
  version: string;
  authors?: (string | { name: string; affiliation?: string; orcid?: string })[];
  tier?: "verified" | "reviewed" | "community";
  dagType?: "domain-level" | "study-specific";
  workflowStatus?: "draft" | "under-review" | "ratified";
  contributors?: { name: string; affiliation?: string; initials: string }[];
  alternativeDags?: {
    slug: string;
    title: string;
    nodeCount: number;
    note: string;
  }[];
  adjustment_sets?: { nodes: string[]; estimand: string }[];
  created_at: string;
  updated_at: string;
}

export interface DagNodeRef {
  key: string;
}

export type EvidenceLevel = "strong" | "moderate" | "limited" | "theoretical";

export interface Reference {
  pmid?: string;
  doi?: string;
  label?: string;
}

export interface NodeFrontmatter {
  key: string;
  dagpedia_label: string;
  category: NodeCategory;
  mesh_id?: string;
  mesh_label?: string;
  mesh_url?: string;
  dagpedia_id?: string;
  rationale?: string;
  aliases?: string[];
  references?: Reference[];
  definition?: string;
}

export type NodeCategory =
  | "exposure"
  | "outcome"
  | "confounder"
  | "mediator"
  | "collider"
  | "social_determinant"
  | "biological"
  | "demographic"
  | "other";
