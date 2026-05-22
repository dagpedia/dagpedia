import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvidenceLevel, NodeRole } from "@/types/dag";

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
  weak: "bg-gray-100 text-gray-700 border-transparent",
  conflicting: "bg-orange-100 text-orange-800 border-transparent",
  "expert-opinion": "bg-violet-100 text-violet-800 border-transparent",
  unknown: "bg-zinc-100 text-zinc-600 border-transparent",
};

export function RoleBadge({ role }: { role: NodeRole }) {
  return (
    <Badge className={cn("text-sm", roleStyles[role])}>
      {role}
    </Badge>
  );
}

export function EvidenceBadge({
  level,
  label,
}: {
  level: EvidenceLevel;
  label?: string;
}) {
  return (
    <Badge className={cn("text-sm", evidenceStyles[level])}>
      {label ?? level}
    </Badge>
  );
}
