export type { DagFrontmatter } from "./dag-data-schema";

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
