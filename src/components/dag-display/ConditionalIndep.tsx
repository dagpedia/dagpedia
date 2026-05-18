import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}: {
  items: string[];
  loading?: boolean;
}) {
  return (
    <Card size="sm" className="gap-2 py-3">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-base font-semibold">
          Conditional independencies
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-2">
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
      </CardContent>
    </Card>
  );
}
