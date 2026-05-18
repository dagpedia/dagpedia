import { EvidenceBadge } from "./badges";

export function EvidenceLegend() {
  return (
    <div className="mt-3 space-y-1.5 border-t pt-3 text-[0.65rem] text-muted-foreground">
      <p className="font-medium uppercase tracking-wide">Evidence</p>
      <ul className="space-y-1">
        <li className="flex items-center gap-2">
          <EvidenceBadge level="strong" />
          <span>RCT or consistent observational evidence</span>
        </li>
        <li className="flex items-center gap-2">
          <EvidenceBadge level="moderate" />
          <span>Observational (some inconsistency)</span>
        </li>
        <li className="flex items-center gap-2">
          <EvidenceBadge level="assumed" />
          <span>Structural / theoretical assumption</span>
        </li>
        <li className="flex items-center gap-2">
          <EvidenceBadge level="weak" />
          <span>Limited or conflicting evidence</span>
        </li>
      </ul>
    </div>
  );
}
