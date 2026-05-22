import { RoleBadge } from "./badges";
import type { NodeRole } from "@/types/dag";

export const NODE_ROLE_DESCRIPTIONS: Record<NodeRole, string> = {
  exposure:
    "The primary cause or treatment whose effect on the outcome is the estimand of interest.",
  outcome:
    "The health or disease endpoint affected by the exposure and other variables in the DAG.",
  mediator:
    "A variable on a causal path from exposure to outcome; adjusting for it can block part of the total effect.",
  covariate:
    "A variable associated with exposure, outcome, or both, but not on the exposure–outcome causal path; often adjusted to reduce confounding.",
  instrument:
    "A variable that affects the exposure and influences the outcome only through the exposure (instrumental-variable setting).",
  collider:
    "A variable caused by two or more others in the DAG; conditioning on it can open a non-causal path and induce bias.",
};

const NODE_ROLES: NodeRole[] = [
  "exposure",
  "outcome",
  "mediator",
  "covariate",
  "instrument",
  "collider",
];

export function NodeRoleLegendContent() {
  return (
    <ul className="space-y-1.5">
      {NODE_ROLES.map((role) => (
        <li key={role} className="flex items-start gap-2">
          <RoleBadge role={role} />
          <span>{NODE_ROLE_DESCRIPTIONS[role]}</span>
        </li>
      ))}
    </ul>
  );
}

export const CENTRALITY_DESCRIPTION =
  "Normalized degree centrality (0–1): how connected this node is relative to the most connected node in the DAG. Higher values mean more direct ties to other variables.";

export function CentralityLegendContent() {
  return <p className="text-sm text-muted-foreground">{CENTRALITY_DESCRIPTION}</p>;
}

export function NodesLegendContent() {
  return (
    <div className="space-y-3 text-sm text-popover-foreground">
      <div>
        <p className="mb-1.5 font-medium">Node roles</p>
        <NodeRoleLegendContent />
      </div>
      <div>
        <p className="mb-1 font-medium">Centrality</p>
        <CentralityLegendContent />
      </div>
    </div>
  );
}
