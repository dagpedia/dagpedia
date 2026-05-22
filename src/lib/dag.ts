import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { dagFrontmatterSchema } from "./dag-data-schema";
import { loadDagData } from "./dag-data";
import { getNodeLabel } from "./nodes";

const DAGS_DIR = path.join(process.cwd(), "src/content/dags");

export interface DagContent {
  frontmatter: Record<string, unknown>;
  body: string;
  slug: string;
}

export interface DagListItem {
  slug: string;
  title: string;
  exposureLabel: string;
  outcomeLabel: string;
  nodeCount: number;
  edgeCount: number;
  keywords: string[];
  contextSummary: string;
}

export function getAllDags(): DagContent[] {
  if (!fs.existsSync(DAGS_DIR)) return [];

  const files = fs.readdirSync(DAGS_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      return getDag(slug);
    })
    .filter((dag): dag is DagContent => dag !== null)
    .sort((a, b) => {
      const titleA =
        (dagFrontmatterSchema.safeParse(a.frontmatter).data?.title as string) ??
        a.slug;
      const titleB =
        (dagFrontmatterSchema.safeParse(b.frontmatter).data?.title as string) ??
        b.slug;
      return titleA.localeCompare(titleB);
    });
}

export function getDagListItems(): DagListItem[] {
  return getAllDags()
    .map((dag) => {
      const parsed = dagFrontmatterSchema.safeParse(dag.frontmatter);
      const data = loadDagData(dag.slug);
      if (!parsed.success || !data) return null;

      const exposureNode = data.graph.nodes.find((n) => n.role === "exposure");
      const outcomeNode = data.graph.nodes.find((n) => n.role === "outcome");
      if (!exposureNode || !outcomeNode) return null;

      const ctx = parsed.data.context;
      return {
        slug: dag.slug,
        title: parsed.data.title,
        exposureLabel: getNodeLabel(exposureNode.id),
        outcomeLabel: getNodeLabel(outcomeNode.id),
        nodeCount: data.computed.node_count,
        edgeCount: data.computed.edge_count,
        keywords: parsed.data.keywords,
        contextSummary: `${ctx.population} · ${ctx.geographic} · ${ctx.era}`,
      };
    })
    .filter((item): item is DagListItem => item !== null);
}

export function getDag(slug: string): DagContent | null {
  const filePath = path.join(DAGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data,
    body: content,
    slug,
  };
}

export function extractDagittyString(body: string): string | null {
  const match = body.match(/```dagitty\r?\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export function getDagsByNode(nodeKey: string): DagContent[] {
  return getAllDags().filter((dag) => {
    const data = loadDagData(dag.slug);
    return data?.graph.nodes.some((n) => n.id === nodeKey) ?? false;
  });
}
