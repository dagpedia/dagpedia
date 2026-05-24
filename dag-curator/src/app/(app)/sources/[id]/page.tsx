"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Wand2, Trash2 } from "lucide-react";
import type { Source } from "@/lib/db/schema";
import { SourceStatusBadge } from "@/components/candidates/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function SourceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sources/${params.id}`)
      .then((r) => r.json())
      .then((d) => setSource(d.source))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleExtract() {
    setExtracting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/sources/${params.id}/extract`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");

      if (data.status === "extracted" && data.candidateId) {
        router.push(`/candidates/${data.candidateId}`);
      } else {
        setMessage(data.message ?? "Extraction skipped: no DAG found");
        setSource((s) => s ? { ...s, status: "skipped" } : s);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExtracting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this source?")) return;
    await fetch(`/api/sources/${params.id}`, { method: "DELETE" });
    router.push("/sources");
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (!source) {
    return <div className="p-6">Source not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/sources"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sources
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SourceStatusBadge status={source.status} />
            <span className="text-xs text-muted-foreground">{source.sourceType}</span>
          </div>
          <h1 className="text-xl font-bold">
            {source.title ?? source.doi ?? source.pmid ?? "Untitled source"}
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="text-muted-foreground hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Metadata */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4 text-sm space-y-2">
        {source.doi && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">DOI</span>
            <a
              href={`https://doi.org/${source.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {source.doi}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {source.pmid && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">PMID</span>
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {source.pmid}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {source.url && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">URL</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 truncate"
            >
              {source.url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-16">Added</span>
          <span>{formatDate(source.createdAt)}</span>
          {source.submittedBy && (
            <span className="text-muted-foreground">by @{source.submittedBy}</span>
          )}
        </div>
      </div>

      {/* Abstract */}
      {source.abstract && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Abstract</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {source.abstract}
          </p>
        </div>
      )}

      {/* Error */}
      {source.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600 mb-4">
          {source.errorMessage}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="bg-muted rounded p-3 text-sm text-muted-foreground mb-4">
          {message}
        </div>
      )}

      {/* Extract action */}
      {(source.status === "pending" || source.status === "failed" || source.status === "skipped") && (
        <button
          onClick={handleExtract}
          disabled={extracting}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {extracting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {extracting ? "Extracting DAG…" : "Extract DAG with Claude"}
        </button>
      )}
    </div>
  );
}
