import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { computeDagMeta } from "../src/lib/dagitty/analyze";
import { loadDagitty } from "./lib/load-dagitty";
import { extractDagittyString } from "../src/lib/dag";
import { getNodeLabel } from "../src/lib/nodes";

const DAGS_DIR = path.join(process.cwd(), "src", "content", "dags");
const OUTPUT_DIR = path.join(process.cwd(), "public", "dag-meta");

function generate() {
  const runtime = loadDagitty();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(DAGS_DIR).filter((f) => f.endsWith(".md"));
  let count = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(DAGS_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    if (!data.exposure || !data.outcome) {
      console.warn(`⊘ ${slug}: missing exposure/outcome, skipping meta`);
      continue;
    }

    const dagittyCode =
      (typeof data.dag === "string" ? data.dag.trim() : "") ||
      extractDagittyString(content) ||
      "";
    if (!dagittyCode) {
      console.warn(`⊘ ${slug}: no dagitty code, skipping meta`);
      continue;
    }

    const exposureLabel = getNodeLabel(data.exposure);
    const outcomeLabel = getNodeLabel(data.outcome);
    const meta = computeDagMeta(dagittyCode, {
      exposure: exposureLabel,
      outcome: outcomeLabel,
    }, runtime);

    const outPath = path.join(OUTPUT_DIR, `${slug}.json`);
    fs.writeFileSync(
      outPath,
      JSON.stringify({ slug, ...meta }, null, 2)
    );
    count++;
    console.log(`✓ ${slug}.json`);
  }

  console.log(`\n✓ dag-meta generated (${count} files)`);
}

generate();
