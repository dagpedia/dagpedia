"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DagittyGlobals = {
  GraphParser?: { parseGuess: (code: string) => unknown };
  GraphLayouter?: { Spring: new (graph: unknown) => { layout: () => void } };
  DAGittyController?: new (opts: {
    canvas: HTMLElement;
    graph: unknown;
    interactive: boolean;
  }) => { getView: () => { draw: () => void } };
};

function rootGlobal(): DagittyGlobals {
  return globalThis as DagittyGlobals;
}

function isBundledDagittyLoaded(): boolean {
  const g = rootGlobal();
  return !!(g.GraphParser && g.DAGittyController);
}

function parseDagGuess(code: string) {
  const g = rootGlobal();
  if (g.GraphParser?.parseGuess) {
    return g.GraphParser.parseGuess(code);
  }
  throw new Error("GraphParser missing");
}

function relayoutGraph(graph: unknown) {
  const g = rootGlobal();
  if (g.GraphLayouter?.Spring) {
    new g.GraphLayouter.Spring(graph).layout();
  }
}

function createGraphView(canvas: HTMLElement, graph: unknown) {
  const g = rootGlobal();
  if (g.DAGittyController) {
    const ctrl = new g.DAGittyController({
      canvas,
      graph,
      interactive: true,
    });
    return { view: ctrl.getView(), graph };
  }
  throw new Error("DAGittyController missing");
}

export type DagittyMount = {
  resetLayout: () => void;
};

export function useDagitty(
  dagittyString: string,
  scriptLoaded: boolean
): {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  error: string | null;
  mount: DagittyMount | null;
} {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{ draw: () => void } | null>(null);
  const graphRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [mount, setMount] = useState<DagittyMount | null>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scriptLoaded || !isBundledDagittyLoaded()) return;

    try {
      const graph = parseDagGuess(dagittyString);
      const { view, graph: g } = createGraphView(canvas, graph);
      viewRef.current = view;
      graphRef.current = g;
      setError(null);
      setMount({
        resetLayout: () => {
          if (graphRef.current && viewRef.current) {
            relayoutGraph(graphRef.current);
            viewRef.current.draw();
          }
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Render failed");
      setMount(null);
    }
  }, [dagittyString, scriptLoaded]);

  useEffect(() => {
    if (!scriptLoaded) return;

    const maxMs = 8000;
    const stepMs = 50;
    const start = Date.now();

    const tick = () => {
      if (isBundledDagittyLoaded()) {
        render();
        return;
      }
      if (Date.now() - start > maxMs) {
        setError("dagitty.js not loaded");
        return;
      }
      setTimeout(tick, stepMs);
    };

    tick();
  }, [scriptLoaded, render]);

  return { canvasRef, error, mount };
}
