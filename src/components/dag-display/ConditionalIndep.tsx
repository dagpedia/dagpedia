import { PanelCard } from "./PanelCard";

function formatLine(line: string) {
  const match = line.match(/^(.+? ⊥ .+?)( \| .+)?$/);
  if (!match) return <span>{line}</span>;
  return (
    <span>
      {match[1]}
      {match[2] && (
        <span className="text-muted-foreground">{match[2]}</span>
      )}
    </span>
  );
}

export function ConditionalIndep({
  items,
  loading,
  divided = false,
  bare = false,
}: {
  items: string[];
  loading?: boolean;
  divided?: boolean;
  bare?: boolean;
}) {
  return (
    <PanelCard title="Conditional independencies" divided={divided} bare={bare}>
      {loading ? (
        <p className="text-sm text-muted-foreground">Computing…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No implied conditional independencies found.
        </p>
      ) : (
        <ul className="space-y-1.5 font-mono text-sm">
          {items.map((line) => (
            <li key={line}>{formatLine(line)}</li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
