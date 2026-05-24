import Link from "next/link";
import { listCandidates } from "@/lib/db/queries/candidates";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import type { CandidateStatus } from "@/types/curator";

const STATUSES: { value: CandidateStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "reviewing", label: "Reviewing" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "submitted", label: "Submitted" },
  { value: "merged", label: "Merged" },
];

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const activeStatus = (statusParam as CandidateStatus) ?? "all";

  const candidates = await listCandidates({
    status:
      activeStatus === "all"
        ? undefined
        : [activeStatus as CandidateStatus],
    limit: 100,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Extracted DAGs awaiting review
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New candidate
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1 mb-6">
        {STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/candidates" : `/candidates?status=${value}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeStatus === value || (value === "all" && !statusParam)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No candidates</p>
          <p className="text-sm mt-1">
            Add a source and extract a DAG to see candidates here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}
