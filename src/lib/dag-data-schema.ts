import { z } from "zod";
import {
  asZodEnumTuple,
  getSlugPattern,
  loadEvidenceLevels,
  loadManifest,
} from "./schema-loader";

const manifest = loadManifest();
const slugSchema = z.string().regex(getSlugPattern());

export const evidenceLevelSchema = z.enum(
  asZodEnumTuple(loadEvidenceLevels())
);

export const openSlugSchema = slugSchema;

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
    population: openSlugSchema,
    geographic: openSlugSchema,
    era: openSlugSchema,
    note: z
      .string()
      .max(manifest.fields.context.properties.note.maxLength)
      .optional(),
  }),
  keywords: z
    .array(openSlugSchema)
    .min(manifest.fields.keywords.minItems),
  alternatives: z.array(z.string()),
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
    md_committed_at: z.string(),
    main_committed_at: z.string().nullable().optional(),
    pr_merged_at: z.string().nullable().optional(),
    pr_number: z.number().int().positive().nullable().optional(),
    contributors: z
      .array(
        z.object({
          name: z.string(),
          email: z.string(),
          commits: z.number().int().positive(),
        })
      )
      .default([]),
  }),
  llm: z.object({
    edge_set_sorted: z.array(z.string()),
    text: z.string(),
    body_plain: z.string().nullable().optional(),
  }),
});

export type DagDataFile = z.infer<typeof dagDataFileSchema>;

const idPattern = new RegExp(manifest.fields.id.pattern);

export const dagFrontmatterSchema = z.object({
  id: z.string().regex(idPattern),
  title: z
    .string()
    .min(manifest.fields.title.minLength)
    .max(manifest.fields.title.maxLength),
  context: z.object({
    population: openSlugSchema,
    geographic: openSlugSchema,
    era: openSlugSchema,
    note: z
      .string()
      .max(manifest.fields.context.properties.note.maxLength)
      .optional(),
  }),
  dagitty: z.string().min(manifest.fields.dagitty.minLength),
  evidence: z.record(z.string(), evidenceLevelSchema),
  keywords: z
    .array(openSlugSchema)
    .min(manifest.fields.keywords.minItems),
  alternatives: z.array(z.string()).default([]),
});

export type DagFrontmatter = z.infer<typeof dagFrontmatterSchema>;
