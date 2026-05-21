import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PanelCard } from "./PanelCard";

function formatLine(line: string) {
  const match = line.match(/^(.+? ⊥ .+?)( \| .+)?$/);
  if (!match) return <span>{line}</span>;
  return (
    <span>
      <span className="font-mono">{match[1]}</span>
      {match[2] && (
        <span className="font-mono text-muted-foreground">{match[2]}</span>
      )}
    </span>
  );
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
    <p className="px-1 py-1 text-sm text-muted-foreground">Computing…</p>
  ) : items.length === 0 ? (
    <p className="px-1 py-1 text-sm text-muted-foreground">
      No implied conditional independencies found.
    </p>
  ) : (
    <div className="space-y-1">
      <div className="border-b px-1 pb-2 text-sm">
        <span className="font-medium text-muted-foreground">Statement</span>
      </div>
      {items.map((line) => (
        <div
          key={line}
          className="rounded-md border-2 border-transparent px-1 py-1 text-sm"
        >
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
