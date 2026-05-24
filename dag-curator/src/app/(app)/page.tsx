import { countSourcesByStatus } from "@/lib/db/queries/sources";
import { countCandidatesByStatus } from "@/lib/db/queries/candidates";
import { listPrSubmissions } from "@/lib/db/queries/submissions";
import {
  BookOpen,
  Microscope,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [sourceCounts, candidateCounts, prs] = await Promise.all([
    countSourcesByStatus(),
    countCandidatesByStatus(),
    listPrSubmissions(100),
  ]);

  const totalSources = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  const totalCandidates = Object.values(candidateCounts).reduce((a, b) => a + b, 0);
  const totalPRs = prs.length;
  const mergedPRs = prs.filter((p) => p.status === "merged").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          DAGpedia curation pipeline overview
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Sources"
          value={totalSources}
          icon={BookOpen}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Candidates"
          value={totalCandidates}
          icon={Microscope}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="PRs Submitted"
          value={totalPRs}
          icon={GitPullRequest}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Merged"
          value={mergedPRs}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Source pipeline */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Source Pipeline
          </h2>
          <div className="space-y-2">
            {(
              [
                { key: "pending", label: "Pending extraction", icon: Clock, color: "text-yellow-600" },
                { key: "processing", label: "Processing", icon: Clock, color: "text-blue-600" },
                { key: "extracted", label: "Extracted", icon: CheckCircle2, color: "text-green-600" },
                { key: "failed", label: "Failed", icon: AlertCircle, color: "text-red-600" },
                { key: "skipped", label: "Skipped", icon: XCircle, color: "text-gray-500" },
              ] as const
            ).map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <span className="font-medium">{sourceCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate pipeline */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Microscope className="h-4 w-4 text-primary" />
            Candidate Pipeline
          </h2>
          <div className="space-y-2">
            {(
              [
                { key: "draft", label: "Draft", color: "bg-gray-400" },
                { key: "reviewing", label: "Under review", color: "bg-blue-400" },
                { key: "approved", label: "Approved", color: "bg-green-400" },
                { key: "submitted", label: "PR submitted", color: "bg-purple-400" },
                { key: "merged", label: "Merged", color: "bg-teal-400" },
                { key: "rejected", label: "Rejected", color: "bg-red-400" },
              ] as const
            ).map(({ key, label, color }) => {
              const count = candidateCounts[key] ?? 0;
              const pct = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-0.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm font-medium text-primary mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/sources/new"
            className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
          >
            + Add source
          </a>
          <a
            href="/candidates?status=approved"
            className="text-xs bg-card border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors text-muted-foreground"
          >
            View approved candidates
          </a>
          <a
            href="/searches"
            className="text-xs bg-card border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors text-muted-foreground"
          >
            Manage PubMed searches
          </a>
        </div>
      </div>
    </div>
  );
}
