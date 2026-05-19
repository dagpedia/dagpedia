import {
  buildAdjustmentSets,
  formatConditionalIndependency,
} from "@/lib/dag-format";
import type { AdjustmentSet } from "@/types/dag";
import { parseDagittyGraph } from "./adapter";
import type { DagittyRuntime } from "./types";

export interface DagMetaComputed {
  adjustmentSets: AdjustmentSet[];
  conditionalIndependencies: string[];
}

export function computeDagMeta(
  dagCode: string,
  labels: { exposure: string; outcome: string },
  runtime: DagittyRuntime
): DagMetaComputed {
  const graph = parseDagittyGraph(dagCode, runtime);
  const analyzer = runtime.GraphAnalyzer;

  const implications = analyzer.listMinimalImplications(graph, 50);
  const conditionalIndependencies: string[] = [];
  for (const [x, y, seps] of implications) {
    conditionalIndependencies.push(
      ...formatConditionalIndependency(
        x,
        y,
        seps.map((sep) => sep.map((v) => v.id))
      )
    );
  }

  let adjustmentSets: AdjustmentSet[] = [];
  try {
    const msa = analyzer.listMsasTotalEffect(graph, [], [], 8);
    const sets = msa.map((vertices) => vertices.map((v) => v.id));
    adjustmentSets = buildAdjustmentSets(
      sets,
      labels.exposure,
      labels.outcome
    );
  } catch {
    adjustmentSets = [
      {
        nodes: [],
        estimand: `${labels.exposure} → ${labels.outcome} total effect`,
      },
    ];
  }

  return { adjustmentSets, conditionalIndependencies };
}
