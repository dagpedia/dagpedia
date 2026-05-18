import type { ParsedDagStructure } from "./dag-utils";

/** Degree centrality normalized to 0–1 across nodes in the DAG. */
export function computeDegreeCentrality(
  structure: ParsedDagStructure
): Map<string, number> {
  const scores = new Map<string, number>();
  const n = structure.nodes.size;
  if (n <= 1) {
    for (const id of structure.nodes.keys()) scores.set(id, 1);
    return scores;
  }

  const degree = new Map<string, number>();
  for (const id of structure.nodes.keys()) degree.set(id, 0);

  for (const { from, to } of structure.edges) {
    degree.set(from, (degree.get(from) ?? 0) + 1);
    degree.set(to, (degree.get(to) ?? 0) + 1);
  }

  const maxDegree = Math.max(...degree.values(), 1);
  for (const [id, value] of degree) {
    scores.set(id, value / maxDegree);
  }

  return scores;
}
