"use client";

import Link from "next/link";
import { ChevronDown, GitCommit, GitPullRequest } from "lucide-react";
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
import {
  type DagProvenance,
  contributorHue,
  contributorInitials,
  formatProvenanceDate,
  shortSha,
} from "@/lib/provenance";
import { cn } from "@/lib/utils";

const GITHUB_REPO = "https://github.com/dagpedia/dagpedia";

function TimelineRow({
  label,
  date,
  detail,
  active,
  last,
}: {
  label: string;
  date: string | null;
  detail?: React.ReactNode;
  active?: boolean;
  last?: boolean;
}) {
  if (!date) return null;
  return (
    <div className="flex gap-2.5">
      <div className="flex w-3 shrink-0 flex-col items-center">
        <span
          className={cn(
            "mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-background",
            active ? "bg-green-600" : "bg-muted-foreground/40"
          )}
          aria-hidden
        />
        {!last && <span className="mt-0.5 w-px flex-1 bg-border" aria-hidden />}
      </div>
      <div className={cn("min-w-0 pb-3", last && "pb-0")}>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {formatProvenanceDate(date)}
        </p>
        {detail}
      </div>
    </div>
  );
}

function ContributorStack({
  contributors,
}: {
  contributors: DagProvenance["contributors"];
}) {
  if (contributors.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No contributors in Git history.</p>
    );
  }

  const shown = contributors.slice(0, 6);
  const extra = contributors.length - shown.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {shown.map((c) => {
          const hue = contributorHue(c.email);
          return (
            <span
              key={c.email}
              title={`${c.name} · ${c.commits} commit${c.commits === 1 ? "" : "s"}`}
              className="inline-flex size-7 items-center justify-center rounded-full text-[0.65rem] font-semibold text-white shadow-sm ring-2 ring-background"
              style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
            >
              {contributorInitials(c.name)}
            </span>
          );
        })}
        {extra > 0 && (
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-[0.65rem] font-medium text-muted-foreground ring-2 ring-background">
            +{extra}
          </span>
        )}
      </div>
      <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
        {contributors.map((c) => (
          <li key={c.email} className="flex justify-between gap-2">
            <span className="truncate">{c.name}</span>
            <span className="shrink-0 tabular-nums">{c.commits}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VersionPopover({
  provenance,
  slug,
}: {
  provenance: DagProvenance;
  slug: string;
}) {
  const short = shortSha(provenance.mdCommitSha);
  const showPr =
    provenance.prMergedAt &&
    provenance.prMergedAt !== provenance.mainCommittedAt;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2"
            aria-label={`Content commit ${short}, ratified on main`}
          />
        }
      >
        <GitCommit className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="font-mono text-xs font-semibold">{short}</span>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-1.5 py-0 text-[0.65rem]",
            "border-green-200 bg-green-50 text-green-800"
          )}
        >
          Ratified
        </Badge>
        <ChevronDown className="size-3 opacity-60" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-80 gap-0 p-0">
        <PopoverHeader className="gap-1 border-b px-3 py-2.5">
          <PopoverTitle>Source revision</PopoverTitle>
          <PopoverDescription>
            <code className="font-mono text-xs">{short}</code>
            {" · "}
            {formatProvenanceDate(provenance.mdCommittedAt)}
          </PopoverDescription>
        </PopoverHeader>

        <div className="space-y-3 px-3 py-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Timeline
            </p>
            <TimelineRow
              label="Markdown updated"
              date={provenance.mdCommittedAt}
              detail={
                <Link
                  href={`${GITHUB_REPO}/commit/${provenance.mdCommitSha}`}
                  className="font-mono text-[0.65rem] text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {short}
                </Link>
              }
              active
              last={
                !provenance.mainCommittedAt &&
                !showPr
              }
            />
            <TimelineRow
              label="On main (ratified)"
              date={provenance.mainCommittedAt}
              last={!showPr}
            />
            {showPr && (
              <TimelineRow
                label={
                  provenance.prNumber
                    ? `PR #${provenance.prNumber} merged`
                    : "PR merged"
                }
                date={provenance.prMergedAt}
                detail={
                  provenance.prNumber ? (
                    <Link
                      href={`${GITHUB_REPO}/pull/${provenance.prNumber}`}
                      className="inline-flex items-center gap-0.5 text-[0.65rem] text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitPullRequest className="size-3" aria-hidden />
                      View pull request
                    </Link>
                  ) : undefined
                }
                last
              />
            )}
          </div>

          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contributors
            </p>
            <ContributorStack contributors={provenance.contributors} />
          </div>

          <Link
            href={`${GITHUB_REPO}/commits/main/src/content/dags/${slug}.md`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            View commit history
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
