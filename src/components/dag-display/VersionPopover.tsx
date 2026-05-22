"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, GitCommit, GitPullRequest } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type DagContributor,
  type DagMdCommit,
  type DagProvenance,
  formatProvenanceDate,
  shortSha,
} from "@/lib/provenance";
import { cn } from "@/lib/utils";

const GITHUB_REPO = "https://github.com/dagpedia/dagpedia";
const GRID_LIMIT = 14;

function TimelineRow({
  label,
  date,
  trailing,
  active,
  last,
}: {
  label: string;
  date: string | null;
  trailing?: React.ReactNode;
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
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-3 pb-3",
          last && "pb-0"
        )}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {formatProvenanceDate(date)}
          </p>
        </div>
        {trailing}
      </div>
    </div>
  );
}

function CommitShaLink({
  short,
  commitsUrl,
  mdCommit,
}: {
  short: string;
  commitsUrl: string;
  mdCommit: DagMdCommit | null;
}) {
  const link = (
    <Link
      href={commitsUrl}
      className="shrink-0 font-mono text-xs font-medium text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {short}
    </Link>
  );

  if (!mdCommit) return link;

  const { author } = mdCommit;
  const showName =
    author.name &&
    author.login &&
    author.name.trim().toLowerCase() !== author.login.toLowerCase();

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex shrink-0">{link}</span>} />
      <TooltipContent
        side="right"
        align="center"
        sideOffset={8}
        className="max-w-[280px] flex-col items-stretch gap-2 p-3 text-left"
      >
        <div className="flex items-center gap-2">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full"
              unoptimized
            />
          ) : null}
          <div className="min-w-0 leading-tight">
            {author.login ? (
              <span className="font-semibold">{author.login}</span>
            ) : (
              <span className="font-semibold">{author.name ?? "Unknown"}</span>
            )}
            {showName ? (
              <span className="ml-1.5 font-normal opacity-80">{author.name}</span>
            ) : null}
          </div>
        </div>
        <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed opacity-90">
          {mdCommit.message}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function ContributorAvatar({
  contributor,
  size = 32,
}: {
  contributor: DagContributor;
  size?: number;
}) {
  return (
    <Image
      src={contributor.avatarUrl}
      alt=""
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-full bg-muted ring-1 ring-border",
        size === 32 ? "size-8" : "size-6"
      )}
      unoptimized
    />
  );
}

function ContributorListItem({ contributor }: { contributor: DagContributor }) {
  const showName =
    contributor.name &&
    contributor.name.trim().toLowerCase() !== contributor.login.toLowerCase();

  return (
    <li>
      <Link
        href={contributor.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 items-center gap-2 rounded-md py-0.5 hover:bg-muted/60"
      >
        <ContributorAvatar contributor={contributor} size={24} />
        <span className="min-w-0 truncate text-sm font-semibold text-foreground">
          {contributor.login}
        </span>
        {showName && (
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {contributor.name}
          </span>
        )}
      </Link>
    </li>
  );
}

function ContributorsSection({
  contributors,
  slug,
}: {
  contributors: DagContributor[];
  slug: string;
}) {
  const commitsUrl = `${GITHUB_REPO}/commits/main/src/content/dags/${slug}.md`;
  const count = contributors.length;

  if (count === 0) {
    return (
      <p className="text-xs text-muted-foreground">No contributors in Git history.</p>
    );
  }

  const grid = contributors.slice(0, GRID_LIMIT);
  const hidden = count - grid.length;
  const useGrid = count > 5;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-foreground">Contributors</h4>
        <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-border px-1.5 py-0 text-xs font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>

      {useGrid ? (
        <div className="flex flex-wrap gap-1">
          {grid.map((c) => (
            <Link
              key={c.login}
              href={c.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={c.login}
              className="rounded-full transition-opacity hover:opacity-80"
            >
              <ContributorAvatar contributor={c} />
            </Link>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {contributors.map((c) => (
            <ContributorListItem key={c.login} contributor={c} />
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <Link
          href={commitsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          + {hidden} contributors
        </Link>
      )}
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
  const commitsUrl = `${GITHUB_REPO}/commits/main/src/content/dags/${slug}.md`;
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
        <PopoverHeader className="border-b px-3 py-2.5">
          <PopoverTitle>Source revision</PopoverTitle>
        </PopoverHeader>

        <div className="space-y-3 px-3 py-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Timeline
            </p>
            <TimelineRow
              label="Markdown updated"
              date={provenance.mdCommittedAt}
              trailing={
                <CommitShaLink
                  short={short}
                  commitsUrl={commitsUrl}
                  mdCommit={provenance.mdCommit}
                />
              }
              active
              last={!provenance.mainCommittedAt && !showPr}
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
                trailing={
                  provenance.prNumber ? (
                    <Link
                      href={`${GITHUB_REPO}/pull/${provenance.prNumber}`}
                      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitPullRequest className="size-3" aria-hidden />
                      #{provenance.prNumber}
                    </Link>
                  ) : undefined
                }
                last
              />
            )}
          </div>

          <div className="border-t pt-3">
            <ContributorsSection
              contributors={provenance.contributors}
              slug={slug}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
