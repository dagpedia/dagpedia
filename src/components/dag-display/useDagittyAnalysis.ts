"use client";

import { useEffect, useState } from "react";
import {
  buildAdjustmentSets,
  formatConditionalIndependency,
} from "@/lib/dag-format";
import type { AdjustmentSet } from "@/types/dag";

type DagittyGlobals = {
  GraphParser?: { parseGuess: (code: string) => DagittyGraph };
  GraphAnalyzer?: {
    listMinimalImplications: (
      g: DagittyGraph,
      max: number
    ) => [string, string, DagittyVertex[][]][];
    listMsasTotalEffect: (
      g: DagittyGraph,
      M: unknown[],
      F: unknown[],
      max: number
    ) => DagittyVertex[][];
  };
};

type DagittyVertex = { id: string };
type DagittyGraph = {
  getSources: () => DagittyVertex[];
  getTargets: () => DagittyVertex[];
};

function rootGlobal(): DagittyGlobals {
  return globalThis as DagittyGlobals;
}

function isDagittyReady(): boolean {
  const g = rootGlobal();
  return !!(g.GraphParser && g.GraphAnalyzer);
}

export function useDagittyAnalysis(
  dagittyCode: string,
  exposureLabel: string,
  outcomeLabel: string,
  scriptLoaded: boolean
) {
  const [adjustmentSets, setAdjustmentSets] = useState<AdjustmentSet[]>([]);
  const [conditionalIndependencies, setConditionalIndependencies] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptLoaded || !dagittyCode) return;

    const maxMs = 8000;
    const stepMs = 50;
    const start = Date.now();

    const run = () => {
      if (!isDagittyReady()) {
        if (Date.now() - start > maxMs) {
          setError("dagitty.js not loaded");
          setLoading(false);
        } else {
          setTimeout(run, stepMs);
        }
        return;
      }

      try {
        const g = rootGlobal();
        const graph = g.GraphParser!.parseGuess(dagittyCode);
        const analyzer = g.GraphAnalyzer!;

        const implications = analyzer.listMinimalImplications(graph, 50);
        const lines: string[] = [];
        for (const [x, y, seps] of implications) {
          const formatted = formatConditionalIndependency(
            x,
            y,
            seps.map((sep) => sep.map((v) => v.id))
          );
          lines.push(...formatted);
        }
        setConditionalIndependencies(lines);

        try {
          const msa = analyzer.listMsasTotalEffect(graph, [], [], 8);
          const sets = msa.map((vertices) => vertices.map((v) => v.id));
          setAdjustmentSets(
            buildAdjustmentSets(sets, exposureLabel, outcomeLabel)
          );
        } catch {
          setAdjustmentSets([
            {
              nodes: [],
              estimand: `${exposureLabel} → ${outcomeLabel} total effect`,
            },
          ]);
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    run();
  }, [dagittyCode, exposureLabel, outcomeLabel, scriptLoaded]);

  return { adjustmentSets, conditionalIndependencies, loading, error };
}
