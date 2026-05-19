/** Stable key for a directed edge (matches canvas ↔ edge list). */
export function dagEdgeKey(from: string, to: string): string {
  return `${from}-${to}`;
}
