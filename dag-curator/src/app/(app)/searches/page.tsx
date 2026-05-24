"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Loader2, Play } from "lucide-react";

interface SearchConfig {
  id: string;
  query: string;
  schedule: string;
  lastRunAt: string | null;
  enabled: boolean;
  createdBy: string;
}

const DEFAULT_QUERIES = [
  'epidemiology[ti] AND "directed acyclic graph"[tiab]',
  '"causal DAG" AND epidemiology',
  '"causal diagram" AND confounding AND epidemiology',
];

export default function SearchesPage() {
  const [searches, setSearches] = useState<SearchConfig[]>([]);
  const [newQuery, setNewQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<{ query: string; added: number } | null>(null);

  // Load searches from API (stub for now — searches are stored in DB)
  // For MVP, we just let users trigger ad-hoc PubMed searches
  async function runSearch(query: string) {
    setRunning(query);
    setResults(null);
    try {
      const res = await fetch("/api/pubmed/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, maxResults: 20 }),
      });
      const data = await res.json();
      setResults({ query, added: data.added?.length ?? 0 });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Search failed");
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">PubMed Searches</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search PubMed for papers containing epidemiological DAGs and add them as sources.
          Saved queries run automatically every day via Vercel Cron.
        </p>
      </div>

      {/* Ad-hoc search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Run a PubMed search
        </h2>
        <div className="flex gap-2">
          <input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder='e.g. "directed acyclic graph" AND epidemiology'
            className="flex-1 px-3 py-2 border border-border rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => e.key === "Enter" && newQuery.trim() && runSearch(newQuery.trim())}
          />
          <button
            onClick={() => newQuery.trim() && runSearch(newQuery.trim())}
            disabled={!!running || !newQuery.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Search
          </button>
        </div>

        {results && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            ✓ Added {results.added} new source{results.added !== 1 ? "s" : ""} from "{results.query}"
            {results.added === 0 && " (all results already in database)"}
          </div>
        )}
      </div>

      {/* Suggested queries */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium mb-3">Suggested queries</h2>
        <div className="space-y-2">
          {DEFAULT_QUERIES.map((q) => (
            <div key={q} className="flex items-center gap-2 group">
              <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 text-muted-foreground">
                {q}
              </code>
              <button
                onClick={() => { setNewQuery(q); runSearch(q); }}
                disabled={!!running}
                className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Run
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Automatic scheduling</p>
        <p>
          Searches are automatically run daily at midnight UTC via Vercel Cron (configured in{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">vercel.json</code>).
          The cron endpoint calls <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/cron/pubmed</code>.
        </p>
      </div>
    </div>
  );
}
