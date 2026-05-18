import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { DagFrontmatter } from "./types";
import { getNodeLabel } from "./nodes";
import type { DagTier, DagType } from "@/types/dag";

const DAGS_DIR = path.join(process.cwd(), "src/content/dags");

export interface DagContent {
  frontmatter: DagFrontmatter;
  body: string;
  slug: string;
}

export interface DagListItem {
  slug: string;
  title: string;
  exposureLabel: string;
  outcomeLabel: string;
  tier: DagTier;
  dagType?: DagType;
  evidenceLevel: string;
  nodeCount: number;
  tags: string[];
  version: string;
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
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export function getDagListItems(): DagListItem[] {
  return getAllDags().map((dag) => {
    const { frontmatter, slug } = dag;
    return {
      slug,
      title: frontmatter.title,
      exposureLabel: getNodeLabel(frontmatter.exposure),
      outcomeLabel: getNodeLabel(frontmatter.outcome),
      tier: frontmatter.tier ?? "community",
      dagType: frontmatter.dagType,
      evidenceLevel: frontmatter.evidence_level,
      nodeCount: frontmatter.nodes?.length ?? 0,
      tags: frontmatter.tags ?? [],
      version: frontmatter.version,
    };
  });
}

export function getDag(slug: string): DagContent | null {
  const filePath = path.join(DAGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DagFrontmatter,
    body: content,
    slug,
  };
}

export function extractDagittyString(body: string): string | null {
  const match = body.match(/```dagitty\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export function getDagsByNode(nodeKey: string): DagContent[] {
  return getAllDags().filter((dag) =>
    dag.frontmatter.nodes.some((n) => n.key === nodeKey)
  );
}
