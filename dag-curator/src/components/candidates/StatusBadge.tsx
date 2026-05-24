import { cn } from "@/lib/utils";
import type { CandidateStatus, SourceStatus } from "@/types/curator";
import { STATUS_COLORS, SOURCE_STATUS_COLORS } from "@/types/curator";

export function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {status}
    </span>
  );
}

export function SourceStatusBadge({ status }: { status: SourceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        SOURCE_STATUS_COLORS[status]
      )}
    >
      {status}
    </span>
  );
}
