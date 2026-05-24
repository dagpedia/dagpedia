"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DagViewer } from "@/components/dag/DagViewer";
import { EVIDENCE_LEVELS } from "@/types/dag";
import { parseDagittyEdges, validateDagitty } from "@/lib/dag-format";

const DEFAULT_DAGITTY = `dag {
  exposure [exposure]
  outcome [outcome]
  confounder -> exposure
  confounder -> outcome
  exposure -> outcome
}`;

export default function NewCandidatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dagId, setDagId] = useState("");
  const [title, setTitle] = useState("");
  const [dagitty, setDagitty] = useState(DEFAULT_DAGITTY);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [context, setContext] = useState({
    population: "general-adults",
    geographic: "north-america-europe",
    era: "1990s-present",
  });
  const [keywords, setKeywords] = useState("");

  const edges = parseDagittyEdges(dagitty);
  const dagErrors = validateDagitty(dagitty).errors;

  // Sync evidence keys when dagitty changes
  const syncedEvidence = Object.fromEntries(
    edges.map((e) => [e, evidence[e] ?? "unknown"])
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dagErrors.length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const kwArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dagId, title, dagitty,
          evidence: syncedEvidence,
          context,
          keywords: kwArray.length ? kwArray : ["epidemiology"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      router.push(`/candidates/${data.candidate.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/candidates"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to candidates
      </Link>

      <h1 className="text-2xl font-bold mb-6">New candidate</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">DAG ID (kebab-case) *</label>
                <input
                  value={dagId}
                  onChange={(e) => setDagId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  required
                  placeholder="exposure-outcome-context"
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Exposure and outcome in population"
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Keywords (comma-separated)</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="exposure, outcome, mediation"
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-medium">Context</h2>
              {(["population", "geographic", "era"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{field}</label>
                  <input
                    value={context[field]}
                    onChange={(e) => setContext((c) => ({ ...c, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>

            {edges.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="text-sm font-medium mb-3">Evidence per edge</h2>
                <div className="space-y-2">
                  {edges.map((edge) => (
                    <div key={edge} className="flex items-center gap-2">
                      <code className="text-xs flex-1">{edge}</code>
                      <select
                        value={syncedEvidence[edge] ?? "unknown"}
                        onChange={(e) => setEvidence((ev) => ({ ...ev, [edge]: e.target.value }))}
                        className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none"
                      >
                        {EVIDENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground block mb-2">dagitty code *</label>
              <textarea
                value={dagitty}
                onChange={(e) => setDagitty(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full px-3 py-2 border border-border rounded text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono resize-y"
              />
              {dagErrors.map((e) => (
                <p key={e} className="text-xs text-red-600 mt-1">• {e}</p>
              ))}
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-4 min-h-40">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
              {dagErrors.length === 0 && <DagViewer dagitty={dagitty} />}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving || dagErrors.length > 0 || !dagId || !title}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create candidate
          </button>
          <Link href="/candidates" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
