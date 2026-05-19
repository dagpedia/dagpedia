import { Fragment } from "react";
import { cn } from "@/lib/utils";

const TOKEN_PATTERN =
  /(\/\/[^\n]*|\bdag\b|\[[^\]]+\]|->|[{}]|[a-zA-Z_][\w]*|\s+|.)/g;

function tokenClass(token: string): string | undefined {
  if (token.startsWith("//")) return "text-muted-foreground italic";
  if (token === "dag") return "font-semibold text-violet-600 dark:text-violet-400";
  if (token.startsWith("[") && token.endsWith("]"))
    return "text-amber-700 dark:text-amber-300";
  if (token === "->") return "text-sky-600 dark:text-sky-400";
  if (token === "{" || token === "}") return "text-muted-foreground";
  if (/^[a-zA-Z_][\w]*$/.test(token)) return "text-foreground";
  return undefined;
}

export function DagittyHighlightedCode({ code }: { code: string }) {
  const lines = code.split("\n");

  return (
    <pre
      className={cn(
        "p-3 font-mono text-sm leading-relaxed",
        "whitespace-pre-wrap break-words bg-muted/30"
      )}
    >
      <code>
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && "\n"}
            {tokenizeLine(line)}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}

function tokenizeLine(line: string) {
  const parts = line.match(TOKEN_PATTERN);
  if (!parts) return line;

  return parts.map((part, index) => {
    const className = tokenClass(part);
    if (!className) return <Fragment key={index}>{part}</Fragment>;
    return (
      <span key={index} className={className}>
        {part}
      </span>
    );
  });
}
