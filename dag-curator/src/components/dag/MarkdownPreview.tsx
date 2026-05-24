"use client";

import { useMemo } from "react";
import { formatDagMarkdown } from "@/lib/dag-format";
import type { Candidate } from "@/lib/db/schema";

export function MarkdownPreview({ candidate }: { candidate: Candidate }) {
  const markdown = useMemo(() => formatDagMarkdown(candidate), [candidate]);

  return (
    <div className="relative">
      <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap font-mono">
        {markdown}
      </pre>
      <button
        onClick={() => navigator.clipboard?.writeText(markdown)}
        className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground bg-background border border-border rounded px-2 py-0.5 transition-colors"
      >
        Copy
      </button>
    </div>
  );
}
