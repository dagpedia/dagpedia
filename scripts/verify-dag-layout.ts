import { getDag, extractDagittyString } from "../src/lib/dag";
import { parseDagittyStructure } from "../src/lib/dag-utils";

const EXPECTED: Record<string, { nodes: number; edges: number }> = {
  "smoking-lung-cancer": { nodes: 7, edges: 9 },
  "ses-cvd-classic": { nodes: 7, edges: 11 },
};

let failed = false;

for (const [slug, expected] of Object.entries(EXPECTED)) {
  const dag = getDag(slug);
  if (!dag) {
    console.error(`✗ ${slug}: file not found`);
    failed = true;
    continue;
  }

  const code = extractDagittyString(dag.body);
  if (!code) {
    console.error(`✗ ${slug}: no dagitty block`);
    failed = true;
    continue;
  }

  const structure = parseDagittyStructure(code);
  const ok =
    structure.nodes.size === expected.nodes &&
    structure.edges.length === expected.edges;

  if (ok) {
    console.log(
      `✓ ${slug}: ${structure.nodes.size} nodes, ${structure.edges.length} edges`
    );
  } else {
    console.error(
      `✗ ${slug}: expected ${expected.nodes} nodes / ${expected.edges} edges, ` +
        `got ${structure.nodes.size} / ${structure.edges.length}`
    );
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
