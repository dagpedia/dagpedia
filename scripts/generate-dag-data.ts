import crypto from "crypto";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { computeDagMeta } from "../src/lib/dagitty/analyze";
import { parseDagittyGraph } from "../src/lib/dagitty/adapter";
import {
  dagDataFileSchema,
  dagFrontmatterSchema,
  type DagDataFile,
} from "../src/lib/dag-data-schema";
import {
  inferNodeRoles,
  parseDagittyStructure,
} from "../src/lib/dag-utils";
import { getNodeLabel } from "../src/lib/nodes";
import {
  fetchGithubCommit,
  resolveGithubContributors,
} from "./lib/github-contributors";
import { getGitMetadata, MD_REL_PREFIX } from "./lib/git-metadata";
import { loadDagitty } from "./lib/load-dagitty";

const DAGS_DIR = path.join(process.cwd(), "src", "content", "dags");
const DATA_DIR = path.join(process.cwd(), "_data");

function newUuid(): string {
  return crypto.randomUUID();
}

function edgeKey(from: string, to: string): string {
  return `${from} -> ${to}`;
}

function loadExisting(slug: string): DagDataFile | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const parsed = dagDataFileSchema.safeParse(
    JSON.parse(fs.readFileSync(filePath, "utf-8"))
  );
  return parsed.success ? parsed.data : null;
}

function preserveUuids(
  existing: DagDataFile | null,
  dagUuid: string,
  nodeIds: string[],
  edges: { from: string; to: string }[]
): {
  dagUuid: string;
  nodeUuids: Map<string, string>;
  edgeUuids: Map<string, string>;
} {
  const nodeUuids = new Map<string, string>();
  const edgeUuids = new Map<string, string>();

  if (existing) {
    for (const n of existing.graph.nodes) {
      nodeUuids.set(n.id, n.uuid);
    }
    for (const e of existing.graph.edges) {
      edgeUuids.set(edgeKey(e.from, e.to), e.uuid);
    }
  }

  const finalDagUuid = existing?.uuid ?? dagUuid;

  for (const id of nodeIds) {
    if (!nodeUuids.has(id)) nodeUuids.set(id, newUuid());
  }
  for (const e of edges) {
    const key = edgeKey(e.from, e.to);
    if (!edgeUuids.has(key)) edgeUuids.set(key, newUuid());
  }

  return { dagUuid: finalDagUuid, nodeUuids, edgeUuids };
}

function buildAdjustmentSetsPayload(
  adjustmentSets: { nodes: string[]; estimand: string }[],
  exposureId: string,
  outcomeId: string
): DagDataFile["computed"]["adjustment_sets"] {
  const total: string[][] = [];
  const direct: string[][] = [];

  for (const set of adjustmentSets) {
    const nodes = set.nodes;
    if (set.estimand.toLowerCase().includes("direct")) {
      direct.push(nodes);
    } else {
      total.push(nodes);
    }
  }

  if (total.length === 0 && adjustmentSets.length > 0) {
    total.push(adjustmentSets[0].nodes);
  }

  return {
    total_effect: total,
    direct_effect: direct.length > 0 ? direct : undefined,
  };
}

function computeDirectEffectSets(
  dagittyCode: string,
  exposureId: string,
  outcomeId: string,
  runtime: ReturnType<typeof loadDagitty>
): string[][] {
  try {
    const graph = parseDagittyGraph(dagittyCode, runtime);
    const analyzer = runtime.GraphAnalyzer;
    const sets = analyzer.listMsasDirectEffect(graph, [], []);
    return sets.map((vertices: { id: string }[]) =>
      vertices.map((v) => v.id).filter((id) => id !== exposureId && id !== outcomeId)
    );
  } catch {
    return [];
  }
}

function buildLlmText(
  title: string,
  exposureId: string,
  outcomeId: string,
  context: DagDataFile["context"],
  edges: DagDataFile["graph"]["edges"],
  adjustmentTotal: string[],
  mediators: string[]
): string {
  const edgeList = [...edges]
    .sort((a, b) => edgeKey(a.from, a.to).localeCompare(edgeKey(b.from, b.to)))
    .map((e) => `${e.from}->${e.to} [${e.evidence}]`)
    .join(", ");

  const adj =
    adjustmentTotal.length > 0 ? adjustmentTotal.join(", ") : "none";
  const med = mediators.length > 0 ? mediators.join(", ") : "none";

  return (
    `DAG: ${title}. Exposure: ${exposureId}. Outcome: ${outcomeId}. ` +
    `Context: ${context.population}, ${context.geographic}, ${context.era}. ` +
    `Edges: ${edgeList}. Adjustment set (total effect): ${adj}. Mediator: ${med}.`
  );
}

async function generateOne(
  slug: string,
  runtime: ReturnType<typeof loadDagitty>
): Promise<DagDataFile> {
  const raw = fs.readFileSync(path.join(DAGS_DIR, `${slug}.md`), "utf-8");
  const { data } = matter(raw);
  const fm = dagFrontmatterSchema.parse(data);
  const dagittyCode = fm.dagitty.trim();

  const structure = parseDagittyStructure(dagittyCode);
  const roles = inferNodeRoles(structure, "", "");

  let exposureId = "";
  let outcomeId = "";
  for (const [id, role] of roles) {
    if (role === "exposure") exposureId = id;
    if (role === "outcome") outcomeId = id;
  }
  if (!exposureId || !outcomeId) {
    for (const [id, tagged] of structure.nodes) {
      if (tagged === "exposure") exposureId = id;
      if (tagged === "outcome") outcomeId = id;
    }
  }
  if (!exposureId || !outcomeId) {
    throw new Error(`${slug}: dagitty must declare [exposure] and [outcome]`);
  }

  const rolesResolved = inferNodeRoles(structure, exposureId, outcomeId);
  const nodeIds = [...structure.nodes.keys()];
  const graphEdges = structure.edges.map((e) => ({ from: e.from, to: e.to }));

  const existing = loadExisting(slug);
  const { dagUuid, nodeUuids, edgeUuids } = preserveUuids(
    existing,
    newUuid(),
    nodeIds,
    graphEdges
  );

  const graphNodes = nodeIds.map((id) => ({
    uuid: nodeUuids.get(id)!,
    id,
    role: rolesResolved.get(id) ?? "covariate",
  }));

  const graphEdgesOut = graphEdges.map((e) => {
    const key = edgeKey(e.from, e.to);
    const evidenceKey = key;
    const evidence = fm.evidence[evidenceKey];
    if (!evidence) {
      throw new Error(`${slug}: missing evidence for ${key}`);
    }
    return {
      uuid: edgeUuids.get(key)!,
      from: e.from,
      to: e.to,
      evidence,
    };
  });

  const exposureLabel = getNodeLabel(exposureId);
  const outcomeLabel = getNodeLabel(outcomeId);
  const meta = computeDagMeta(dagittyCode, { exposure: exposureLabel, outcome: outcomeLabel }, runtime);

  const directSets = computeDirectEffectSets(
    dagittyCode,
    exposureId,
    outcomeId,
    runtime
  );
  const adjustmentSets = [...meta.adjustmentSets];
  for (const nodes of directSets) {
    if (nodes.length === 0) continue;
    adjustmentSets.push({
      nodes,
      estimand: `${exposureLabel} → ${outcomeLabel} direct effect`,
    });
  }

  const adjustmentPayload = buildAdjustmentSetsPayload(
    adjustmentSets,
    exposureId,
    outcomeId
  );

  const mediators = graphNodes
    .filter((n) => n.role === "mediator")
    .map((n) => n.id);

  const totalAdj = adjustmentPayload.total_effect?.[0] ?? [];

  const edgeSetSorted = graphEdgesOut
    .map((e) => `${e.from}->${e.to}`)
    .sort();

  const gitBase = getGitMetadata(slug);
  const mdCommit =
    (await fetchGithubCommit(gitBase.md_commit_sha)) ?? gitBase.md_commit;
  const git = {
    ...gitBase,
    md_commit: mdCommit,
    contributors: await resolveGithubContributors(
      `${MD_REL_PREFIX}/${slug}.md`,
      gitBase.contributors
    ),
  };

  const file: DagDataFile = {
    uuid: dagUuid,
    id: fm.id,
    title: fm.title,
    context: fm.context,
    keywords: fm.keywords,
    alternatives: fm.alternatives,
    graph: {
      nodes: graphNodes,
      edges: graphEdgesOut,
      dagitty: dagittyCode,
    },
    computed: {
      node_count: graphNodes.length,
      edge_count: graphEdgesOut.length,
      adjustment_sets: adjustmentPayload,
      conditional_independencies: meta.conditionalIndependencies,
    },
    git,
    llm: {
      edge_set_sorted: edgeSetSorted,
      text: buildLlmText(
        fm.title,
        exposureId,
        outcomeId,
        fm.context,
        graphEdgesOut,
        totalAdj,
        mediators
      ),
      body_plain: null,
    },
  };

  if (existing?.deprecated) {
    (file as DagDataFile & { deprecated?: boolean }).deprecated = true;
    if (existing.superseded_by) {
      (file as DagDataFile & { superseded_by?: string }).superseded_by =
        existing.superseded_by;
    }
  }

  return file;
}

async function generateAll(): Promise<void> {
  const runtime = loadDagitty();
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const files = fs.readdirSync(DAGS_DIR).filter((f) => f.endsWith(".md"));
  let count = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const data = await generateOne(slug, runtime);
    dagDataFileSchema.parse(data);
    const outPath = path.join(DATA_DIR, `${slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
    count++;
    console.log(`✓ _data/${slug}.json`);
  }

  console.log(`\n✓ dag data generated (${count} files)`);
}

async function checkAll(): Promise<void> {
  const runtime = loadDagitty();
  const files = fs.readdirSync(DAGS_DIR).filter((f) => f.endsWith(".md"));
  let failed = false;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const expected =
      JSON.stringify(await generateOne(slug, runtime), null, 2) + "\n";
    const outPath = path.join(DATA_DIR, `${slug}.json`);
    if (!fs.existsSync(outPath)) {
      console.error(`✗ missing ${outPath}`);
      failed = true;
      continue;
    }
    const actual = fs.readFileSync(outPath, "utf-8");
    if (actual !== expected) {
      console.error(`✗ _data/${slug}.json is out of sync (run npm run generate-dag-data)`);
      failed = true;
    } else {
      console.log(`✓ _data/${slug}.json`);
    }
  }

  if (failed) process.exit(1);
}

const args = process.argv.slice(2);
void (async () => {
  if (args.includes("--check")) {
    await checkAll();
  } else {
    await generateAll();
  }
})();
