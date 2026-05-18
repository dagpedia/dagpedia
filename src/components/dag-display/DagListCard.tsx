import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DagTypeBadge, TierBadge } from "./badges";
import type { DagListItem } from "@/lib/dag";

export function DagListCard({ dag }: { dag: DagListItem }) {
  return (
    <li>
      <Link href={`/dags/${dag.slug}`} className="block transition-opacity hover:opacity-90">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-lg font-semibold tracking-tight">{dag.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge className="bg-red-100 text-red-800 border-transparent">
                  {dag.exposureLabel}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge className="bg-violet-100 text-violet-800 border-transparent">
                  {dag.outcomeLabel}
                </Badge>
                <span className="text-muted-foreground">
                  · {dag.nodeCount} nodes · evidence: {dag.evidenceLevel}
                </span>
              </div>
              {dag.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dag.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <TierBadge tier={dag.tier} />
              {dag.dagType && <DagTypeBadge dagType={dag.dagType} />}
              <span className="text-xs text-muted-foreground">v{dag.version}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
