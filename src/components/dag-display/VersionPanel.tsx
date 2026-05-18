import Link from "next/link";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard } from "./PanelCard";
import type { WorkflowStatus } from "@/types/dag";

const steps: { key: WorkflowStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "under-review", label: "Review" },
  { key: "ratified", label: "Ratified" },
];

function stepIndex(status: WorkflowStatus) {
  return steps.findIndex((s) => s.key === status);
}

export function VersionPanel({
  version,
  updatedAt,
  status,
  slug,
}: {
  version: string;
  updatedAt: string;
  status: WorkflowStatus;
  slug: string;
}) {
  const active = stepIndex(status);

  return (
    <PanelCard title="Version">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">v{version}</span>
          {updatedAt && (
            <span className="text-muted-foreground">{updatedAt}</span>
          )}
        </div>
        <ol className="flex items-center justify-between gap-1">
          {steps.map((step, index) => {
            const filled = index <= active;
            return (
              <li
                key={step.key}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full border",
                    filled
                      ? "border-teal-600 bg-teal-500"
                      : "border-muted-foreground/40 bg-transparent"
                  )}
                />
                <span className="text-[0.6rem] text-muted-foreground">
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
        <Link
          href={`/dags/${slug}#changelog`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <History className="size-3.5" />
          Changelog
        </Link>
      </div>
    </PanelCard>
  );
}
