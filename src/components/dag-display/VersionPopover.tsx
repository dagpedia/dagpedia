"use client";

import Link from "next/link";
import { ChevronDown, GitCommit } from "lucide-react";
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

function shortSha(sha: string): string {
  if (!sha || sha.length < 7) return sha || "unknown";
  return sha.slice(0, 7);
}

export function VersionPopover({
  mdCommitSha,
  slug,
}: {
  mdCommitSha: string;
  slug: string;
}) {
  const short = shortSha(mdCommitSha);

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
            Markdown last changed at commit{" "}
            <code className="font-mono text-xs">{mdCommitSha}</code>
          </PopoverDescription>
        </PopoverHeader>

        <div className="space-y-2 px-3 py-3 text-sm text-muted-foreground">
          <p>
            Merged to <strong>main</strong> is treated as ratified. Version history
            and contributors are tracked in Git — not duplicated in frontmatter.
          </p>
          <Link
            href={`https://github.com/dagpedia/dagpedia/commits/main/src/content/dags/${slug}.md`}
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
