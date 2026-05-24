"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { Candidate } from "@/lib/db/schema";
import { DagViewer } from "@/components/dag/DagViewer";
import { EVIDENCE_LEVELS, type EvidenceLevel } from "@/types/dag";
import { parseDagittyEdges, validateDagitty } from "@/lib/dag-format";

export default function CandidateEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Editable state
  const [dagId, setDagId] = useState("");
  const [title, setTitle] = useState("");
  const [dagitty, setDagitty] = useState("");
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [context, setContext] = useState({ population: "", geographic: "", era: "", note: "" });
  const [keywords, setKeywords] = useState("");
  const [body, setBody] = useState("");

  const dagErrors = validateDagitty(dagitty).errors;
  const edges = parseDagittyEdges(dagitty);

  useEffect(() => {
    fetch(`/api/candidates/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const c = d.candidate as Candidate;
        setCandidate(c);
        setDagId(c.dagId);
        setTitle(c.title);
        setDagitty(c.dagitty);
        setEvidence(JSON.parse(c.evidence));
        setContext(JSON.parse(c.context));
        setKeywords((JSON.parse(c.keywords) as string[]).join(", "));
        setBody(c.body);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Auto-sync evidence keys when dagitty changes
  useEffect(() => {
    setEvidence((prev) => {
      const updated: Record<string, string> = {};
      for (const edge of edges) {
        updated[edge] = prev[edge] ?? "unknown";
      }
      return updated;
    });
  }, [dagitty]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const kwArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch(`/api/candidates/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dagId, title, dagitty, evidence, context,
          keywords: kwArray, body,
          status: "reviewing",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push(`/candidates/${params.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (!candidate) return <div className="p-6">Not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/candidates/${params.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to review
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || dagErrors.length > 0}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit candidate</h1>

      {message && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600 mb-4">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Basic fields */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">DAG ID (kebab-case)</label>
              <input
                value={dagId}
                onChange={(e) => setDagId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Keywords (comma-separated)</label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Context */}
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

          {/* Evidence per edge */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-3">Evidence per edge</h2>
            {edges.length === 0 && (
              <p className="text-xs text-muted-foreground">No edges parsed yet</p>
            )}
            <div className="space-y-2">
              {edges.map((edge) => (
                <div key={edge} className="flex items-center gap-2">
                  <code className="text-xs flex-1">{edge}</code>
                  <select
                    value={evidence[edge] ?? "unknown"}
                    onChange={(e) => setEvidence((ev) => ({ ...ev, [edge]: e.target.value }))}
                    className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none"
                  >
                    {EVIDENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* DAG editor with live preview */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">dagitty code</h2>
            <textarea
              value={dagitty}
              onChange={(e) => setDagitty(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full px-3 py-2 border border-border rounded text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono resize-y"
            />
            {dagErrors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {dagErrors.map((e) => (
                  <li key={e} className="text-xs text-red-600">• {e}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Live DAG preview */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Live preview</h2>
            {dagErrors.length === 0 && <DagViewer dagitty={dagitty} />}
          </div>

          {/* Body markdown */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Body (Markdown)</h2>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-border rounded text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
