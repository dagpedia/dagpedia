import fs from "fs";
import path from "path";
import { z } from "zod";
import { getDag, extractDagittyString } from "./dag";
import { getAllDags } from "./dag";
import {
  buildDagEdges,
  buildDagNodes,
  inferTier,
  mapLegacyEvidence,
  parseDagittyStructure,
} from "./dag-utils";
import { computeDegreeCentrality } from "./content-index";
import type {
  AdjustmentSet,
  AlternativeDag,
  DagAuthor,
  DagContributor,
  DagPageData,
  DagReference,
  DagTier,
  DagType,
  WorkflowStatus,
} from "@/types/dag";

const DAG_META_DIR = path.join(process.cwd(), "public", "dag-meta");

const dagMetaFileSchema = z.object({
  slug: z.string(),
  adjustmentSets: z.array(
    z.object({
      nodes: z.array(z.string()),
      estimand: z.string(),
    })
  ),
  conditionalIndependencies: z.array(z.string()),
});

function loadDagMetaFromJson(slug: string): {
  adjustmentSets: AdjustmentSet[];
  conditionalIndependencies: string[];
} {
  const filePath = path.join(DAG_META_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return { adjustmentSets: [], conditionalIndependencies: [] };
  }
  const parsed = dagMetaFileSchema.safeParse(
    JSON.parse(fs.readFileSync(filePath, "utf-8"))
  );
  if (!parsed.success) {
    return { adjustmentSets: [], conditionalIndependencies: [] };
  }
  return {
    adjustmentSets: parsed.data.adjustmentSets,
    conditionalIndependencies: parsed.data.conditionalIndependencies,
  };
}

const authorSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    affiliation: z.string().optional(),
    orcid: z.string().optional(),
  }),
]);

const dagFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  exposure: z.string(),
  outcome: z.string(),
  tier: z.enum(["verified", "reviewed", "community"]).optional(),
  dagType: z.enum(["domain-level", "study-specific"]).optional(),
  dag_type: z.enum(["domain-level", "study-specific"]).optional(),
  workflowStatus: z.enum(["draft", "under-review", "ratified"]).optional(),
  workflow_status: z.enum(["draft", "under-review", "ratified"]).optional(),
  evidence_level: z
    .enum(["strong", "moderate", "limited", "theoretical"])
    .optional(),
  nodes: z
    .array(z.union([z.object({ key: z.string() }), z.string()]))
    .optional(),
  version: z.string(),
  updatedAt: z.string().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
  authors: z.array(authorSchema).optional(),
  contributors: z
    .array(
      z.object({
        name: z.string(),
        affiliation: z.string().optional(),
        initials: z.string(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  references: z
    .array(
      z.object({
        doi: z.string().optional(),
        pmid: z.string().optional(),
        citation: z.string().optional(),
        label: z.string().optional(),
      })
    )
    .optional(),
  alternativeDags: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        nodeCount: z.number(),
        note: z.string(),
      })
    )
    .optional(),
  related_dags: z.array(z.string()).optional(),
  dag: z.string().optional(),
  edges: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        evidence: z
          .enum(["strong", "moderate", "weak", "assumed", "limited", "theoretical"])
          .optional(),
      })
    )
    .optional(),
  adjustmentSets: z
    .array(
      z.object({
        nodes: z.array(z.string()),
        estimand: z.string(),
      })
    )
    .optional(),
  conditionalIndependencies: z.array(z.string()).optional(),
});

function normalizeAuthors(raw: z.infer<typeof dagFrontmatterSchema>["authors"]): DagAuthor[] {
  if (!raw?.length) return [];
  return raw.map((entry) =>
    typeof entry === "string" ? { name: entry } : entry
  );
}

function normalizeContributors(
  authors: DagAuthor[],
  contributors: z.infer<typeof dagFrontmatterSchema>["contributors"]
): DagContributor[] {
  if (contributors?.length) return contributors;
  return authors.map((author) => ({
    name: author.name,
    affiliation: author.affiliation,
    initials: author.name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
}

function normalizeReferences(
  refs: z.infer<typeof dagFrontmatterSchema>["references"]
): DagReference[] {
  if (!refs?.length) return [];
  return refs.map((ref) => ({
    doi: ref.doi,
    pmid: ref.pmid,
    citation: ref.citation ?? ref.label ?? "",
  }));
}

function buildEdges(
  structure: ReturnType<typeof parseDagittyStructure>,
  fmEdges: z.infer<typeof dagFrontmatterSchema>["edges"],
  defaultEvidence: ReturnType<typeof mapLegacyEvidence>
) {
  if (fmEdges?.length) {
    return fmEdges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      evidence: edge.evidence
        ? mapLegacyEvidence(edge.evidence)
        : defaultEvidence,
    }));
  }
  return buildDagEdges(structure, defaultEvidence);
}

function resolveAlternativeDags(
  fm: z.infer<typeof dagFrontmatterSchema>,
  allTitles: Map<string, string>
): AlternativeDag[] {
  if (fm.alternativeDags?.length) return fm.alternativeDags;
  if (!fm.related_dags?.length) return [];
  return fm.related_dags.map((slug) => ({
    slug,
    title: allTitles.get(slug) ?? slug,
    nodeCount: 0,
    note: "Related DAG",
  }));
}

export function getDagPageData(slug: string): DagPageData | null {
  const dag = getDag(slug);
  if (!dag) return null;

  const parsed = dagFrontmatterSchema.safeParse(dag.frontmatter);
  if (!parsed.success) return null;

  const fm = parsed.data;
  const dagittyCode =
    fm.dag?.trim() || extractDagittyString(dag.body) || "";
  if (!dagittyCode) return null;

  const structure = parseDagittyStructure(dagittyCode);
  const centrality = computeDegreeCentrality(structure);
  const defaultEvidence = mapLegacyEvidence(fm.evidence_level);

  const tier: DagTier = fm.tier ?? inferTier(fm.evidence_level);
  const dagType: DagType = fm.dagType ?? fm.dag_type ?? "domain-level";
  const workflowStatus: WorkflowStatus =
    fm.workflowStatus ??
    fm.workflow_status ??
    (tier === "verified" ? "ratified" : "under-review");

  const authors = normalizeAuthors(fm.authors);
  const titleBySlug = new Map(
    getAllDags().map((d) => [d.slug, d.frontmatter.title])
  );
  const dagMeta = loadDagMetaFromJson(slug);

  return {
    slug,
    body: dag.body,
    id: fm.id,
    title: fm.title,
    exposure: fm.exposure,
    outcome: fm.outcome,
    tier,
    dagType,
    workflowStatus,
    version: fm.version,
    updatedAt: fm.updatedAt ?? fm.updated_at ?? fm.created_at ?? "",
    authors,
    contributors: normalizeContributors(authors, fm.contributors),
    tags: fm.tags ?? [],
    references: normalizeReferences(fm.references),
    dagittyCode,
    alternativeDags: resolveAlternativeDags(fm, titleBySlug),
    nodes: buildDagNodes(structure, fm.exposure, fm.outcome, centrality),
    edges: buildEdges(structure, fm.edges, defaultEvidence),
    adjustmentSets: dagMeta.adjustmentSets,
    conditionalIndependencies: dagMeta.conditionalIndependencies,
  };
}
