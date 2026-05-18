"use client";

import { useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DagittyCodePanel({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => setOpen((value) => !value)}
      >
        <Code2 className="size-3.5" />
        {open ? "Hide DAGitty code" : "Show DAGitty code"}
      </Button>
      {open && (
        <div className="rounded-lg border bg-muted/40">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              DAGitty
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-sm"
              onClick={copyCode}
            >
              {copied ? (
                <Check className="size-3.5 text-green-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre
            className={cn(
              "max-h-64 overflow-auto p-3 font-mono text-sm leading-relaxed",
              "whitespace-pre-wrap break-words text-foreground"
            )}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
