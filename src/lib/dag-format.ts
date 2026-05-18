import type { AdjustmentSet } from "@/types/dag";

export function formatConditionalIndependency(
  x: string,
  y: string,
  separators: string[][]
): string[] {
  if (separators.length === 0) {
    return [`${x} ⊥ ${y}`];
  }
  return separators.map((sep) => {
    const z = sep.filter(Boolean).join(", ");
    return z ? `${x} ⊥ ${y} | ${z}` : `${x} ⊥ ${y}`;
  });
}

export function buildAdjustmentSets(
  sets: string[][],
  exposureLabel: string,
  outcomeLabel: string
): AdjustmentSet[] {
  const estimand = `${exposureLabel} → ${outcomeLabel} total effect`;
  return sets.map((nodes) => ({ nodes, estimand }));
}
