import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

type DagEntry = {
  type: "dag";
  id: string;
  title: string;
  exposure: string;
  outcome: string;
  tags: string[];
  tier: string;
};

type NodeEntry = {
  type: "node";
  id: string;
  label: string;
  category: string;
};

type SearchEntry = DagEntry | NodeEntry;

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readMdFiles(dir: string): matter.GrayMatterFile<string>[] {
  const fullDir = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter(fs.readFileSync(path.join(fullDir, f), "utf-8")));
}

function generate() {
  const index: SearchEntry[] = [];

  for (const { data } of readMdFiles("dags")) {
    if (!data.id || !data.title) continue;
    index.push({
      type: "dag",
      id: data.id,
      title: data.title,
      exposure: data.exposure ?? "",
      outcome: data.outcome ?? "",
      tags: data.tags ?? [],
      tier: data.tier ?? "community",
    });
  }

  for (const { data } of readMdFiles("nodes")) {
    const id = data.id ?? data.key;
    if (!id) continue;
    const label = data.label ?? data.dagpedia_label ?? humanizeKey(id);
    if (!label) continue;
    index.push({
      type: "node",
      id,
      label,
      category: data.category ?? "",
    });
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`✓ search-index.json generated (${index.length} entries)`);
}

generate();
