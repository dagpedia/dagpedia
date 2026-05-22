import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DagListItem } from "@/lib/dag";

export function DagListCard({ dag }: { dag: DagListItem }) {
  return (
    <li>
      <Link
        href={`/dags/${dag.slug}`}
        className="block transition-opacity hover:opacity-90"
      >
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">{dag.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-base">
                <Badge className="border-transparent bg-red-100 text-red-800">
                  {dag.exposureLabel}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge className="border-transparent bg-violet-100 text-violet-800">
                  {dag.outcomeLabel}
                </Badge>
                <span className="text-muted-foreground">
                  · {dag.nodeCount} nodes · {dag.edgeCount} edges
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{dag.contextSummary}</p>
              {dag.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dag.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="text-sm font-normal"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
