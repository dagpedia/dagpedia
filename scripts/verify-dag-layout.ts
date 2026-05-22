import { loadDagData } from "../src/lib/dag-data";

const EXPECTED: Record<string, { nodes: number; edges: number }> = {
  "smoking-lung-cancer": { nodes: 7, edges: 9 },
  "ses-cvd-classic": { nodes: 7, edges: 11 },
};

let failed = false;

for (const [slug, expected] of Object.entries(EXPECTED)) {
  const data = loadDagData(slug);
  if (!data) {
    console.error(`✗ ${slug}: _data/${slug}.json not found`);
    failed = true;
    continue;
  }

  const ok =
    data.computed.node_count === expected.nodes &&
    data.computed.edge_count === expected.edges;

  if (ok) {
    console.log(
      `✓ ${slug}: ${data.computed.node_count} nodes, ${data.computed.edge_count} edges`
    );
  } else {
    console.error(
      `✗ ${slug}: expected ${expected.nodes} nodes / ${expected.edges} edges, ` +
        `got ${data.computed.node_count} / ${data.computed.edge_count}`
    );
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
