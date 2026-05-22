"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ConditionalIndepLegendContent } from "./ConditionalIndepLegend";
import {
  panelListBodyClass,
  panelListEmptyClass,
  panelListHeaderClass,
  panelListRowClass,
} from "./panel-list-styles";
import { PanelCard } from "./PanelCard";

/** Columns: X, ⊥, Y, |, conditioning set */
const statementGridClass =
  "grid w-full grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)] items-center gap-x-1.5";

const symbolCellClass =
  "flex size-full items-center justify-center text-center leading-none";

function parseStatement(line: string): { x: string; y: string; given?: string } | null {
  const match = line.match(/^(.+?) ⊥ (.+?)(?: \| (.+))?$/);
  if (!match) return null;
  return { x: match[1], y: match[2], given: match[3] };
}

function StatementRow({ x, y, given }: { x: string; y: string; given?: string }) {
  return (
    <div className={statementGridClass}>
      <span className="truncate">{x}</span>
      <span className={symbolCellClass} aria-hidden>
        ⊥
      </span>
      <span className="truncate">{y}</span>
      {given ? (
        <>
          <span className={cn(symbolCellClass, "text-muted-foreground")} aria-hidden>
            |
          </span>
          <span className="truncate text-muted-foreground">{given}</span>
        </>
      ) : (
        <>
          <span aria-hidden />
          <span aria-hidden />
        </>
      )}
    </div>
  );
}

function formatLine(line: string) {
  const parsed = parseStatement(line);
  if (!parsed) return <span className="truncate">{line}</span>;
  return <StatementRow {...parsed} />;
}

export function ConditionalIndep({
  items,
  loading,
  divided = false,
  fill = false,
  bare = false,
}: {
  items: string[];
  loading?: boolean;
  divided?: boolean;
  fill?: boolean;
  bare?: boolean;
}) {
  const body = loading ? (
    <p className={panelListEmptyClass}>Computing…</p>
  ) : items.length === 0 ? (
    <p className={panelListEmptyClass}>
      No implied conditional independencies found.
    </p>
  ) : (
    <div className={panelListBodyClass}>
      <div className={panelListHeaderClass}>
        <Tooltip>
          <TooltipTrigger
            className="w-fit cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
            aria-label="Notation: independence and conditioning"
          >
            Statement
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-w-xs bg-popover px-3 py-2 text-popover-foreground"
          >
            <ConditionalIndepLegendContent />
          </TooltipContent>
        </Tooltip>
      </div>
      {items.map((line) => (
        <div key={line} className={cn(panelListRowClass(), "flex items-center")}>
          {formatLine(line)}
        </div>
      ))}
    </div>
  );

  return (
    <PanelCard
      title="Conditional independencies"
      divided={divided}
      fill={fill && !bare}
      bare={bare}
    >
      {fill && !bare ? (
        <ScrollArea className={cn("h-full min-h-0 flex-1")}>{body}</ScrollArea>
      ) : (
        body
      )}
    </PanelCard>
  );
}
