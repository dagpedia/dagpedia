import { cache } from "react";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { getDag, getAllDags } from "./dag";
import { getAllDagDataSlugs, loadDagData } from "./dag-data";
import { dagFrontmatterSchema } from "./dag-data-schema";
import { computeDegreeCentrality } from "./content-index";
import { parseDagittyStructure } from "./dag-utils";
import { getNodeLabel } from "./nodes";
import type {
  AdjustmentSet,
  AlternativeDag,
  DagContext,
  DagPageData,
  EvidenceLevel,
} from "@/types/dag";

const DAGS_DIR = path.join(process.cwd(), "src", "content", "dags");

function mapEvidence(level: string): EvidenceLevel {
  switch (level) {
    case "strong":
    case "moderate":
    case "weak":
    case "conflicting":
    case "expert-opinion":
      return level;
    default:
      return "weak";
  }
}

function adjustmentSetsFromData(
  data: NonNullable<ReturnType<typeof loadDagData>>,
  exposureLabel: string,
  outcomeLabel: string
): AdjustmentSet[] {
  const sets: AdjustmentSet[] = [];
  const { adjustment_sets } = data.computed;

  for (const nodes of adjustment_sets.total_effect ?? []) {
    sets.push({
      nodes,
      estimand: `${exposureLabel} → ${outcomeLabel} total effect`,
    });
  }
  for (const nodes of adjustment_sets.direct_effect ?? []) {
    sets.push({
      nodes,
      estimand: `${exposureLabel} → ${outcomeLabel} direct effect`,
    });
  }
  return sets;
}

function resolveAlternatives(
  ids: string[],
  titleBySlug: Map<string, string>,
  nodeCountBySlug: Map<string, number>
): AlternativeDag[] {
  return ids.map((slug) => ({
    slug,
    title: titleBySlug.get(slug) ?? slug,
    nodeCount: nodeCountBySlug.get(slug) ?? 0,
    note: "Alternative structure",
  }));
}

export const getDagPageData = cache((slug: string): DagPageData | null => {
  const dag = getDag(slug);
  const data = loadDagData(slug);
  if (!dag || !data) return null;

  const fmParsed = dagFrontmatterSchema.safeParse(dag.frontmatter);
  if (!fmParsed.success) return null;

  const exposureNode = data.graph.nodes.find((n) => n.role === "exposure");
  const outcomeNode = data.graph.nodes.find((n) => n.role === "outcome");
  if (!exposureNode || !outcomeNode) return null;

  const exposureId = exposureNode.id;
  const outcomeId = outcomeNode.id;
  const exposureLabel = getNodeLabel(exposureId);
  const outcomeLabel = getNodeLabel(outcomeId);

  const structure = parseDagittyStructure(data.graph.dagitty);
  const centrality = computeDegreeCentrality(structure);

  const titleBySlug = new Map<string, string>();
  const nodeCountBySlug = new Map<string, number>();
  for (const s of getAllDagDataSlugs()) {
    const d = loadDagData(s);
    const mdPath = path.join(DAGS_DIR, `${s}.md`);
    if (fs.existsSync(mdPath)) {
      const { data: md } = matter(fs.readFileSync(mdPath, "utf-8"));
      if (typeof md.title === "string") titleBySlug.set(s, md.title);
    }
    if (d) nodeCountBySlug.set(s, d.computed.node_count);
  }

  const nodes = data.graph.nodes.map((n) => {
    const node: DagPageData["nodes"][number] = {
      id: n.id,
      label: getNodeLabel(n.id),
      role: n.role,
      centrality: centrality.get(n.id),
    };
    const pos = structure.positions.get(n.id);
    if (structure.hasExplicitLayout && pos) {
      node.position = pos;
    }
    return node;
  });

  const edges = data.graph.edges.map((e) => ({
    from: e.from,
    to: e.to,
    evidence: mapEvidence(e.evidence),
  }));

  const context: DagContext = {
    population: data.context.population,
    geographic: data.context.geographic,
    era: data.context.era,
    note: data.context.note,
  };

  return {
    slug,
    body: dag.body,
    id: data.id,
    title: data.title,
    exposure: exposureId,
    outcome: outcomeId,
    context,
    keywords: fmParsed.data.keywords,
    mdCommitSha: data.git.md_commit_sha,
    deprecated: data.deprecated,
    supersededBy: data.superseded_by,
    dagittyCode: data.graph.dagitty,
    alternativeDags: resolveAlternatives(
      fmParsed.data.alternatives,
      titleBySlug,
      nodeCountBySlug
    ),
    nodes,
    edges,
    adjustmentSets: adjustmentSetsFromData(data, exposureLabel, outcomeLabel),
    conditionalIndependencies: data.computed.conditional_independencies,
  };
});
