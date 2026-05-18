import Link from "next/link";
import { GitFork, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DagTypeBadge, TierBadge } from "./badges";
import type { DagTier, DagType } from "@/types/dag";

interface DagPageHeaderProps {
  title: string;
  exposure: { id: string; label: string };
  outcome: { id: string; label: string };
  nodeCount: number;
  edgeCount: number;
  tier: DagTier;
  dagType: DagType;
  version: string;
}

export function DagPageHeader({
  title,
  exposure,
  outcome,
  nodeCount,
  edgeCount,
  tier,
  dagType,
  version,
}: DagPageHeaderProps) {
  return (
    <div className="space-y-3">
      <Link href="/dags" className="text-sm text-brand hover:underline">
        ← All DAGs
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-red-100 text-red-800 border-transparent">
                {exposure.label}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="bg-violet-100 text-violet-800 border-transparent">
                {outcome.label}
              </Badge>
              <span className="text-muted-foreground">
                · {nodeCount} nodes · {edgeCount} edges
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={tier} />
            <DagTypeBadge dagType={dagType} />
            <span className="text-xs text-muted-foreground">v{version}</span>
            <Button variant="outline" size="sm" type="button" disabled>
              <GitFork className="size-3.5" />
              Fork
            </Button>
            <Button variant="outline" size="sm" type="button" disabled>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
