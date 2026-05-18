import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DagTier, DagType, EvidenceLevel, NodeRole } from "@/types/dag";

const tierStyles: Record<DagTier, string> = {
  verified: "bg-green-100 text-green-800 border-transparent",
  reviewed: "bg-blue-100 text-blue-800 border-transparent",
  community: "bg-gray-100 text-gray-700 border-transparent",
};

const roleStyles: Record<NodeRole, string> = {
  exposure: "bg-red-100 text-red-800 border-transparent",
  outcome: "bg-violet-100 text-violet-800 border-transparent",
  mediator: "bg-purple-100 text-purple-800 border-transparent",
  covariate: "bg-slate-100 text-slate-700 border-transparent",
  instrument: "bg-sky-100 text-sky-800 border-transparent",
  collider: "bg-orange-100 text-orange-800 border-transparent",
};

const evidenceStyles: Record<EvidenceLevel, string> = {
  strong: "bg-green-100 text-green-800 border-transparent",
  moderate: "bg-amber-100 text-amber-800 border-transparent",
  assumed: "bg-violet-100 text-violet-800 border-transparent",
  weak: "bg-gray-100 text-gray-700 border-transparent",
};

export function TierBadge({ tier }: { tier: DagTier }) {
  const label =
    tier === "verified" ? "Verified" : tier === "reviewed" ? "Reviewed" : "Community";
  return (
    <Badge variant="secondary" className={cn("text-sm", tierStyles[tier])}>
      {label}
    </Badge>
  );
}

export function DagTypeBadge({ dagType }: { dagType: DagType }) {
  const label = dagType === "domain-level" ? "Domain-level" : "Study-specific";
  return (
    <Badge variant="outline" className="text-sm">
      {label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: NodeRole }) {
  return (
    <Badge className={cn("text-sm", roleStyles[role])}>
      {role}
    </Badge>
  );
}

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return (
    <Badge className={cn("text-sm", evidenceStyles[level])}>
      {level}
    </Badge>
  );
}
