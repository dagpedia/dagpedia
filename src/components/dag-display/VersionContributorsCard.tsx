import Link from "next/link";
import { History, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DagContributor, WorkflowStatus } from "@/types/dag";
import {
  statusBadgeClass,
  statusLabels,
  WorkflowStepper,
} from "./version-shared";

function ContributorRow({ person }: { person: DagContributor }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-8">
        <AvatarFallback className="bg-sky-500 text-xs font-medium text-white">
          {person.initials}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 truncate text-sm">
        <span className="font-medium">{person.name}</span>
        {person.affiliation && (
          <span className="text-muted-foreground"> {person.affiliation}</span>
        )}
      </p>
    </div>
  );
}

export function VersionContributorsCard({
  version,
  updatedAt,
  status,
  slug,
  contributors,
  bare = false,
  className,
}: {
  version: string;
  updatedAt: string;
  status: WorkflowStatus;
  slug: string;
  contributors: DagContributor[];
  bare?: boolean;
  className?: string;
}) {
  const card = (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="font-semibold">v{version}</span>
          <Badge
            variant="outline"
            className={cn("rounded-full", statusBadgeClass[status])}
          >
            {statusLabels[status]}
          </Badge>
        </div>
        {updatedAt && (
          <time
            dateTime={updatedAt}
            className="shrink-0 text-sm text-muted-foreground"
          >
            {updatedAt}
          </time>
        )}
      </div>

      <div className="border-b px-3 py-3">
        <WorkflowStepper status={status} />
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1 space-y-2">
          {contributors.length > 0 ? (
            contributors.map((person) => (
              <ContributorRow key={person.name} person={person} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No contributors</p>
          )}
        </div>
        <Link
          href={`/dags/${slug}#changelog`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0"
          )}
        >
          <History />
          Changelog
        </Link>
      </div>
    </div>
  );

  if (bare) {
    return <div className="px-4 py-3">{card}</div>;
  }

  return (
    <section className="shrink-0 border-t bg-card px-3 py-3">{card}</section>
  );
}
