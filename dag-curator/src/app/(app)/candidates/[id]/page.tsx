"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  GitPullRequest,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { Candidate } from "@/lib/db/schema";
import { CandidateStatusBadge } from "@/components/candidates/StatusBadge";
import { DagViewer } from "@/components/dag/DagViewer";
import { MarkdownPreview } from "@/components/dag/MarkdownPreview";
import { formatDate } from "@/lib/utils";
import type { EvidenceLevel } from "@/types/dag";

const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  strong: "text-green-600",
  moderate: "text-teal-600",
  weak: "text-yellow-600",
  conflicting: "text-orange-600",
  "expert-opinion": "text-blue-600",
  unknown: "text-gray-400",
};

export default function CandidateReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "preview">("overview");

  useEffect(() => {
    fetch(`/api/candidates/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setCandidate(d.candidate);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function action(endpoint: string, extra?: Record<string, string>) {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/candidates/${params.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `${endpoint} failed`);

      if (endpoint === "submit-pr" && data.prUrl) {
        setPrUrl(data.prUrl);
        setMessage({ type: "ok", text: `PR created: ${data.prUrl}` });
        setCandidate((c) => c ? { ...c, status: "submitted" as const } : c);
      } else if (data.candidate) {
        setCandidate(data.candidate);
      } else {
        // Optimistic update
        const newStatus = endpoint === "approve" ? "approved" as const : "rejected" as const;
        setCandidate((c) => c ? { ...c, status: newStatus } : c);
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (!candidate) {
    return <div className="p-6">Candidate not found.</div>;
  }

  const context = JSON.parse(candidate.context) as Record<string, string>;
  const evidence = JSON.parse(candidate.evidence) as Record<string, string>;
  const keywords = JSON.parse(candidate.keywords) as string[];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/candidates"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to candidates
        </Link>
        <Link
          href={`/candidates/${candidate.id}/edit`}
          className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-1.5 hover:border-primary/50 transition-colors"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CandidateStatusBadge status={candidate.status} />
          <code className="text-xs text-muted-foreground">{candidate.dagId}</code>
        </div>
        <h1 className="text-2xl font-bold">{candidate.title}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((kw) => (
            <span key={kw} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(["overview", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "Overview" : "Markdown Preview"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: DAG visualization */}
          <div>
            <h2 className="text-sm font-medium mb-3">DAG</h2>
            <div className="bg-muted/30 border border-border rounded-lg p-4 min-h-48">
              <DagViewer dagitty={candidate.dagitty} />
            </div>

            {/* dagitty code */}
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                dagitty code
              </summary>
              <pre className="mt-2 text-xs bg-muted rounded p-3 overflow-auto font-mono">
                {candidate.dagitty}
              </pre>
            </details>
          </div>

          {/* Right: Metadata */}
          <div className="space-y-4">
            {/* Context */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-medium mb-3">Context</h2>
              <dl className="space-y-1.5 text-sm">
                {Object.entries(context).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Evidence */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-medium mb-3">Evidence levels</h2>
              <div className="space-y-1">
                {Object.entries(evidence).map(([edge, level]) => (
                  <div key={edge} className="flex items-center justify-between text-sm">
                    <code className="text-xs">{edge}</code>
                    <span className={`text-xs font-medium ${EVIDENCE_COLORS[level as EvidenceLevel] ?? "text-gray-400"}`}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance */}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Added {formatDate(candidate.createdAt)} by @{candidate.submittedBy}</p>
              {candidate.extractionModel && (
                <p>Extracted by {candidate.extractionModel}</p>
              )}
              {candidate.reviewedBy && (
                <p>Reviewed by @{candidate.reviewedBy} on {formatDate(candidate.reviewedAt)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <MarkdownPreview candidate={candidate} />
      )}

      {/* Review notes */}
      <div className="mt-6 border-t border-border pt-6">
        <h2 className="text-sm font-medium mb-2">Review notes</h2>
        <textarea
          value={notes || candidate.reviewNotes || ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional: add notes for the PR or reviewer…"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Message */}
      {message && (
        <div className={`mt-3 text-sm rounded p-3 ${
          message.type === "ok"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {message.type === "ok" && prUrl ? (
            <a href={prUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
              PR created: {prUrl} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            message.text
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-3">
        {candidate.status === "draft" && (
          <button
            onClick={() => action("approve")}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Approve
          </button>
        )}

        {(candidate.status === "draft" || candidate.status === "reviewing") && (
          <button
            onClick={() => action("reject")}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject
          </button>
        )}

        {candidate.status === "approved" && (
          <button
            onClick={() => action("submit-pr")}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitPullRequest className="h-4 w-4" />}
            Submit PR to dagpedia
          </button>
        )}

        {candidate.status === "rejected" && (
          <button
            onClick={() => action("approve")}
            disabled={actionLoading}
            className="flex items-center gap-2 border border-green-500 text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            Re-approve
          </button>
        )}
      </div>
    </div>
  );
}
