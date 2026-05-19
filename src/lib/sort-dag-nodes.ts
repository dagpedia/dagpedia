import type { DagNode } from "@/types/dag";

/** exposure → outcome → other nodes (alphabetical by label within each group). */
export function sortDagNodes(
  nodes: DagNode[],
  exposureId: string,
  outcomeId: string
): DagNode[] {
  const rank = (node: DagNode) => {
    if (node.id === exposureId) return 0;
    if (node.id === outcomeId) return 1;
    return 2;
  };

  return [...nodes].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.label.localeCompare(b.label);
  });
}
