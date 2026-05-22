"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PanelCard({
  title,
  titleSuffix,
  titleHelp,
  children,
  className,
  divided = false,
  fill = false,
  bare = false,
}: {
  title: string;
  titleSuffix?: string;
  titleHelp?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
  fill?: boolean;
  bare?: boolean;
}) {
  if (bare) {
    return <div className={cn("px-4 py-3", className)}>{children}</div>;
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        divided && "border-t",
        fill && "h-full min-h-0",
        className
      )}
    >
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {titleHelp ? (
          <Tooltip>
            <TooltipTrigger
              className="w-fit cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
              aria-label={`${title}: legend`}
            >
              {title}
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="max-w-sm bg-popover px-3 py-2 text-popover-foreground"
            >
              {titleHelp}
            </TooltipContent>
          </Tooltip>
        ) : (
          title
        )}
        {titleSuffix}
      </h3>
      <div className={cn(fill && "flex min-h-0 flex-1 flex-col")}>{children}</div>
    </section>
  );
}
