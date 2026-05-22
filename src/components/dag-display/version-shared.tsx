import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "@/types/dag";

export const steps: { key: WorkflowStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "under-review", label: "Review" },
  { key: "ratified", label: "Ratified" },
];

export const statusLabels: Record<WorkflowStatus, string> = {
  draft: "Draft",
  "under-review": "Review",
  ratified: "Ratified",
};

export const statusBadgeClass: Record<WorkflowStatus, string> = {
  draft: "border-muted-foreground/25 bg-muted/60 text-muted-foreground",
  "under-review":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200",
  ratified:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-200",
};

function stepIndex(status: WorkflowStatus) {
  return steps.findIndex((s) => s.key === status);
}

export function WorkflowStepper({ status }: { status: WorkflowStatus }) {
  const active = stepIndex(status);

  return (
    <div className="flex w-full items-center">
      {steps.map((step, index) => (
        <span key={step.key} className="contents">
          {index > 0 && (
            <span
              className={cn(
                "mb-5 h-0.5 min-w-3 flex-1",
                index <= active ? "bg-teal-500" : "bg-border"
              )}
              aria-hidden
            />
          )}
          <span className="flex shrink-0 flex-col items-center gap-1.5">
            <span
              className={cn(
                "size-3 rounded-full",
                index <= active
                  ? "bg-teal-500"
                  : "border border-muted-foreground/35 bg-transparent"
              )}
            />
            <span className="text-xs text-muted-foreground">{step.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
