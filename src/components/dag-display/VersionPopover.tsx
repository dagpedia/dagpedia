"use client";

import Link from "next/link";
import { ChevronDown, History, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export function VersionPopover({
  version,
  updatedAt,
  status,
  slug,
  contributors,
}: {
  version: string;
  updatedAt: string;
  status: WorkflowStatus;
  slug: string;
  contributors: DagContributor[];
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2"
            aria-label={`Version ${version}, ${statusLabels[status]}`}
          />
        }
      >
        <Tag className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="font-semibold">v{version}</span>
        <Badge
          variant="outline"
          className={cn("rounded-full px-1.5 py-0 text-[0.65rem]", statusBadgeClass[status])}
        >
          {statusLabels[status]}
        </Badge>
        <ChevronDown className="size-3 opacity-60" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-80 gap-0 p-0">
        <PopoverHeader className="gap-1 border-b px-3 py-2.5">
          <PopoverTitle>Version {version}</PopoverTitle>
          {updatedAt ? (
            <PopoverDescription>
              <time dateTime={updatedAt}>Updated {updatedAt}</time>
            </PopoverDescription>
          ) : null}
        </PopoverHeader>

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
      </PopoverContent>
    </Popover>
  );
}
