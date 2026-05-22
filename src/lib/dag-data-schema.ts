import { z } from "zod";

export const evidenceLevelSchema = z.enum([
  "strong",
  "moderate",
  "weak",
  "conflicting",
  "expert-opinion",
]);

export const nodeRoleSchema = z.enum([
  "exposure",
  "outcome",
  "mediator",
  "covariate",
  "instrument",
  "collider",
]);

export const dagDataNodeSchema = z.object({
  uuid: z.string().uuid(),
  id: z.string(),
  role: nodeRoleSchema,
});

export const dagDataEdgeSchema = z.object({
  uuid: z.string().uuid(),
  from: z.string(),
  to: z.string(),
  evidence: evidenceLevelSchema,
});

export const dagDataFileSchema = z.object({
  uuid: z.string().uuid(),
  id: z.string(),
  title: z.string(),
  deprecated: z.boolean().optional(),
  superseded_by: z.string().optional(),
  status: z.literal("tombstone").optional(),
  deleted_at: z.string().optional(),
  deleted_reason: z.string().optional(),
  context: z.object({
    population: z.string(),
    geographic: z.string(),
    era: z.string(),
    note: z.string().max(200).optional(),
  }),
  graph: z.object({
    nodes: z.array(dagDataNodeSchema),
    edges: z.array(dagDataEdgeSchema),
    dagitty: z.string(),
  }),
  computed: z.object({
    node_count: z.number().int().nonnegative(),
    edge_count: z.number().int().nonnegative(),
    adjustment_sets: z.object({
      total_effect: z.array(z.array(z.string())).optional(),
      direct_effect: z.array(z.array(z.string())).optional(),
    }),
    conditional_independencies: z.array(z.string()),
  }),
  git: z.object({
    md_commit_sha: z.string(),
  }),
  llm: z.object({
    edge_set_sorted: z.array(z.string()),
    text: z.string(),
    body_plain: z.string().nullable().optional(),
  }),
});

export type DagDataFile = z.infer<typeof dagDataFileSchema>;

export const dagFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().max(80),
  context: z.object({
    population: z.string(),
    geographic: z.string(),
    era: z.string(),
    note: z.string().max(200).optional(),
  }),
  dagitty: z.string().min(1),
  evidence: z.record(z.string(), evidenceLevelSchema),
  keywords: z.array(z.string()).min(1),
  alternatives: z.array(z.string()).default([]),
});

export type DagFrontmatter = z.infer<typeof dagFrontmatterSchema>;
