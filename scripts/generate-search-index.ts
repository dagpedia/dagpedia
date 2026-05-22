import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDagDataSlugs, loadDagData } from "../src/lib/dag-data";
import { getNodeLabel } from "../src/lib/nodes";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

type DagEntry = {
  type: "dag";
  id: string;
  title: string;
  exposure: string;
  outcome: string;
  keywords: string[];
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

  for (const id of getAllDagDataSlugs()) {
    const dagData = loadDagData(id);
    if (!dagData) continue;
    const exposureNode = dagData.graph.nodes.find((n) => n.role === "exposure");
    const outcomeNode = dagData.graph.nodes.find((n) => n.role === "outcome");
    index.push({
      type: "dag",
      id: dagData.id,
      title: dagData.title,
      exposure: exposureNode ? getNodeLabel(exposureNode.id) : "",
      outcome: outcomeNode ? getNodeLabel(outcomeNode.id) : "",
      keywords: dagData.keywords,
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
