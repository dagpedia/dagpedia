import { PanelCard } from "./PanelCard";
import type { AdjustmentSet, DagNode } from "@/types/dag";

export function AdjustmentSets({
  sets,
  nodes,
  loading,
  divided = false,
}: {
  sets: AdjustmentSet[];
  nodes: DagNode[];
  loading?: boolean;
  divided?: boolean;
}) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <PanelCard title="Adjustment sets" divided={divided}>
      {loading ? (
        <p className="text-sm text-muted-foreground">Computing…</p>
      ) : sets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No minimal sets found.</p>
      ) : (
        <ul className="space-y-3">
          {sets.map((set, index) => (
            <li key={`${set.estimand}-${index}`} className="space-y-1">
              <p className="text-sm font-medium leading-snug">{set.estimand}</p>
              <p className="text-sm text-muted-foreground">
                {set.nodes.length > 0
                  ? set.nodes.map((id) => label(id)).join(", ")
                  : "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
