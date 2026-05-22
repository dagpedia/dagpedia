import { EvidenceBadge } from "./badges";

const EVIDENCE_LEVELS = [
  {
    level: "strong" as const,
    description: "RCT or consistent observational evidence",
  },
  {
    level: "moderate" as const,
    description: "Observational (some inconsistency)",
  },
  { level: "weak" as const, description: "Limited evidence" },
  {
    level: "conflicting" as const,
    description: "Conflicting empirical findings",
  },
  {
    level: "expert-opinion" as const,
    description: "Expert opinion or structural assumption",
  },
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
