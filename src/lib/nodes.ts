import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { NodeFrontmatter } from "./types";

const NODES_DIR = path.join(process.cwd(), "src/content/nodes");

const labelCache = new Map<string, string>();

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getNodeLabel(key: string): string {
  const cached = labelCache.get(key);
  if (cached) return cached;

  const filePath = path.join(NODES_DIR, `${key}.md`);
  if (!fs.existsSync(filePath)) {
    const label = humanizeKey(key);
    labelCache.set(key, label);
    return label;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const fm = data as NodeFrontmatter;
  const label = fm.dagpedia_label || humanizeKey(key);
  labelCache.set(key, label);
  return label;
}
