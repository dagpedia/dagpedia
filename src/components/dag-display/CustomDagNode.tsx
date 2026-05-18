"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { NodeRole } from "@/types/dag";

export type CustomDagNodeData = {
  label: string;
  role: NodeRole;
};

const borderByRole: Record<NodeRole, string> = {
  exposure: "border-teal-500",
  outcome: "border-orange-400",
  mediator: "border-purple-500",
  covariate: "border-slate-400",
  instrument: "border-sky-500",
  collider: "border-amber-500",
};

export function CustomDagNode({ data }: NodeProps) {
  const nodeData = data as CustomDagNodeData;
  return (
    <div
      className={cn(
        "min-w-[100px] rounded-md border-2 bg-card px-3 py-2 text-center text-xs font-medium shadow-sm",
        borderByRole[nodeData.role]
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <span className="leading-tight">{nodeData.label}</span>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
    </div>
  );
}
