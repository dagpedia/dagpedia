import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceBadge } from "./badges";
import { EvidenceLegend } from "./EvidenceLegend";
import type { DagEdge, DagNode } from "@/types/dag";

export function EdgeList({
  edges,
  nodes,
}: {
  edges: DagEdge[];
  nodes: DagNode[];
}) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <Card size="sm" className="gap-2 py-3">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-base font-semibold">Edges</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-2">
        <div className="grid grid-cols-[1fr_20px_1fr_80px] gap-x-2 gap-y-2 text-sm">
          <span className="font-medium text-muted-foreground">From</span>
          <span />
          <span className="font-medium text-muted-foreground">To</span>
          <span className="font-medium text-muted-foreground">Evidence</span>
          {edges.map((edge) => (
            <EdgeRow
              key={`${edge.from}-${edge.to}`}
              edge={edge}
              label={label}
            />
          ))}
        </div>
        <EvidenceLegend />
      </CardContent>
    </Card>
  );
}

function EdgeRow({
  edge,
  label,
}: {
  edge: DagEdge;
  label: (id: string) => string;
}) {
  return (
    <div className="contents">
      <span>{label(edge.from)}</span>
      <span className="text-center text-muted-foreground">→</span>
      <span>{label(edge.to)}</span>
      <span>
        <EvidenceBadge level={edge.evidence} />
      </span>
    </div>
  );
}
