"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

type Mode = "doi" | "pmid" | "url";

export default function NewSourcePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("doi");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { sourceType: "manual" };
      if (mode === "doi") body.doi = value.trim();
      else if (mode === "pmid") body.pmid = value.trim();
      else body.url = value.trim();

      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to add source");
      }

      const { source } = await res.json();
      router.push(`/sources/${source.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Link
        href="/sources"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sources
      </Link>

      <h1 className="text-2xl font-bold mb-1">Add source</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Submit a paper for DAG extraction
      </p>

      {/* Mode selector */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
        {(["doi", "pmid", "url"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setValue(""); }}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">
            {mode === "doi" ? "DOI" : mode === "pmid" ? "PubMed ID" : "URL"}
          </label>
          <input
            type={mode === "url" ? "url" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              mode === "doi"
                ? "10.1093/aje/kwag029"
                : mode === "pmid"
                ? "12345678"
                : "https://pubmed.ncbi.nlm.nih.gov/..."
            }
            required
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
          />
          {mode === "doi" && (
            <p className="text-xs text-muted-foreground mt-1">
              We'll automatically fetch the title, abstract, and open-access full text.
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Adding…" : "Add source"}
        </button>
      </form>
    </div>
  );
}
