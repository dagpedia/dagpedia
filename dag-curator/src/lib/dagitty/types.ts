export type DagittyVertex = {
  id: string;
  layout_pos_x?: number;
  layout_pos_y?: number;
  properties?: string[];
};

export type DagittyEdge = {
  v1: DagittyVertex;
  v2: DagittyVertex;
  directed?: number;
};

export type DagittyGraph = {
  getVertices: () => DagittyVertex[];
  getEdges: () => DagittyEdge[];
  getVertex: (id: string) => DagittyVertex;
  isSource?: (v: DagittyVertex) => boolean;
  isTarget?: (v: DagittyVertex) => boolean;
  setType?: (type: string) => void;
};

export type DagittyRuntime = {
  GraphParser: {
    parseGuess: (code: string) => DagittyGraph;
  };
  GraphAnalyzer: {
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
    listMsasDirectEffect: (
      g: DagittyGraph,
      must: unknown[],
      must_not: unknown[]
    ) => DagittyVertex[][];
  };
};
