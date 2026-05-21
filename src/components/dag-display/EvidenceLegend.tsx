import { EvidenceBadge } from "./badges";

const EVIDENCE_LEVELS = [
  { level: "strong" as const, description: "RCT or consistent observational evidence" },
  { level: "moderate" as const, description: "Observational (some inconsistency)" },
  { level: "assumed" as const, description: "Structural / theoretical assumption" },
  { level: "weak" as const, description: "Limited or conflicting evidence" },
];

export function EvidenceLegendContent() {
  return (
    <ul className="space-y-1.5">
      {EVIDENCE_LEVELS.map(({ level, description }) => (
        <li key={level} className="flex items-center gap-2">
          <EvidenceBadge level={level} />
          <span>{description}</span>
        </li>
      ))}
    </ul>
  );
}
