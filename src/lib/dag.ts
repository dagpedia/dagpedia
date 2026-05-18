import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { DagFrontmatter } from "./types";

const DAGS_DIR = path.join(process.cwd(), "src/content/dags");

export interface DagContent {
  frontmatter: DagFrontmatter;
  body: string;
  slug: string;
}

export function getAllDags(): DagContent[] {
  const files = fs.readdirSync(DAGS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    return getDag(slug)!;
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
