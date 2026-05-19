import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dagEdgeKey } from "@/lib/dag-edge-key";
import { cn } from "@/lib/utils";
import { EvidenceBadge } from "./badges";
import { EvidenceLegend } from "./EvidenceLegend";
import type { DagEdge, DagNode } from "@/types/dag";

export function EdgeList({
  edges,
  nodes,
  highlightedEdgeKey = null,
}: {
  edges: DagEdge[];
  nodes: DagNode[];
  highlightedEdgeKey?: string | null;
}) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <Card size="sm" className="gap-2 py-3">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-base font-semibold">Edges</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-2">
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_20px_1fr_80px] gap-x-2 px-1 text-sm">
            <span className="font-medium text-muted-foreground">From</span>
            <span />
            <span className="font-medium text-muted-foreground">To</span>
            <span className="font-medium text-muted-foreground">Evidence</span>
          </div>
          {edges.map((edge) => {
            const key = dagEdgeKey(edge.from, edge.to);
            return (
              <EdgeRow
                key={key}
                edge={edge}
                label={label}
                highlighted={highlightedEdgeKey === key}
              />
            );
          })}
        </div>
        <EvidenceLegend />
      </CardContent>
    </Card>
  );
}

function EdgeRow({
  edge,
  label,
  highlighted,
}: {
  edge: DagEdge;
  label: (id: string) => string;
  highlighted: boolean;
}) {
  return (
    <div
      data-edge-key={dagEdgeKey(edge.from, edge.to)}
      className={cn(
        "grid grid-cols-[1fr_20px_1fr_80px] gap-x-2 rounded-md border-2 px-1 py-1 text-sm transition-colors",
        highlighted
          ? "border-foreground bg-muted/60"
          : "border-transparent"
      )}
    >
      <span>{label(edge.from)}</span>
      <span className="text-center text-muted-foreground" aria-hidden>
        →
      </span>
      <span>{label(edge.to)}</span>
      <span>
        <EvidenceBadge level={edge.evidence} />
      </span>
    </div>
  );
}
