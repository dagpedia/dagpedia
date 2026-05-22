import { PanelCard } from "./PanelCard";
import type { DagContextDisplay } from "@/types/dag";

const ROWS = [
  { key: "population" as const, label: "Population" },
  { key: "geographic" as const, label: "Geographic" },
  { key: "era" as const, label: "Era" },
];

export function ContextPanel({
  context,
  divided = false,
  bare = false,
}: {
  context: DagContextDisplay;
  divided?: boolean;
  bare?: boolean;
}) {
  return (
    <PanelCard title="Context" divided={divided} bare={bare}>
      <dl className="space-y-2.5">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-0.5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium leading-snug">
              {context[key].label}
            </dd>
          </div>
        ))}
        {context.note ? (
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-0.5 border-t pt-2.5">
            <dt className="text-sm text-muted-foreground">Note</dt>
            <dd className="text-sm leading-snug text-muted-foreground">
              {context.note}
            </dd>
          </div>
        ) : null}
      </dl>
    </PanelCard>
  );
}
