import { cn } from "@/lib/utils";

/** Shared header row for Edges / Conditional independencies tables */
export const panelListHeaderClass =
  "border-b px-1 pb-2 text-sm font-medium leading-snug text-muted-foreground";

/** Shared data row sizing and typography */
export function panelListRowClass(
  highlighted = false,
  className?: string
) {
  return cn(
    "min-h-8 rounded-md border-2 px-1 py-1.5 text-sm leading-snug",
    highlighted
      ? "border-foreground bg-muted/60"
      : "border-transparent",
    className
  );
}

export const panelListEmptyClass =
  "px-1 py-1.5 text-sm leading-snug text-muted-foreground";

export const panelListBodyClass = "space-y-1";
