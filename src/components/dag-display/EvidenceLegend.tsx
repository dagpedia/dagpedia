import { EvidenceBadge } from "./badges";
import type { EvidenceLevelLegendItem } from "@/types/dag";

export function EvidenceLegendContent({
  levels,
}: {
  levels: EvidenceLevelLegendItem[];
}) {
  return (
    <ul className="space-y-1.5">
      {levels.map(({ level, label, description }) => (
        <li key={level} className="flex items-center gap-2">
          <EvidenceBadge level={level} label={label} />
          <span>{description}</span>
        </li>
      ))}
    </ul>
  );
}
