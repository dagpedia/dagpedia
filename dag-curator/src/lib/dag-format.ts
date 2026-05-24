/**
 * Format a Candidate into a dagpedia-compatible Markdown file.
 * This output should be saved to src/content/dags/<id>.md in dagpedia.
 */

import * as yaml from "yaml";
import type { Candidate } from "@/lib/db/schema";
import type { DagFrontmatter } from "@/types/dag";

export function formatDagMarkdown(candidate: Candidate): string {
  const evidence = JSON.parse(candidate.evidence) as Record<string, string>;
  const context = JSON.parse(candidate.context) as {
    population: string;
    geographic: string;
    era: string;
    note?: string;
  };
  const keywords = JSON.parse(candidate.keywords) as string[];

  const frontmatter: DagFrontmatter = {
    id: candidate.dagId,
    title: candidate.title,
    context: {
      population: context.population,
      geographic: context.geographic,
      era: context.era,
      ...(context.note ? { note: context.note } : {}),
    },
    dagitty: candidate.dagitty,
    evidence,
    keywords,
  };

  // Serialize with yaml preserving multiline dagitty
  const doc = new yaml.Document();
  doc.contents = doc.createNode(frontmatter);

  // Force dagitty to use block literal style (|)
  const dagittyNode = (doc.contents as yaml.YAMLMap).get("dagitty", true);
  if (dagittyNode && "type" in dagittyNode) {
    (dagittyNode as yaml.Scalar).type = "BLOCK_LITERAL";
  }

  const frontmatterStr = doc.toString().trimEnd();
  const body = candidate.body || defaultBody(candidate.title);

  return `---\n${frontmatterStr}\n---\n\n${body}\n`;
}

function defaultBody(title: string): string {
  return `## Operationalization

<!-- TODO: Define each node's measurement/operationalization -->

## Edge rationale

<!-- TODO: Justify each causal edge with evidence citations -->

## Missing edge rationale

<!-- TODO: Explain absent plausible edges -->

## Context and reusability

<!-- TODO: Describe when/where this DAG applies -->

## Known limitations

<!-- TODO: Note unmeasured confounders, simplifications -->
`;
}

/** Validate that a dagitty string has [exposure] and [outcome] nodes */
export function validateDagitty(dagitty: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dagitty.includes("[exposure]")) {
    errors.push("No [exposure] node found");
  }
  if (!dagitty.includes("[outcome]")) {
    errors.push("No [outcome] node found");
  }
  if (!dagitty.trim().startsWith("dag {")) {
    errors.push("dagitty must start with 'dag {'");
  }

  // Check for forbidden tags
  const forbidden = ["[mediator]", "[covariate]", "[instrument]", "[collider]"];
  for (const tag of forbidden) {
    if (dagitty.includes(tag)) {
      errors.push(
        `Forbidden tag ${tag} — use plain nodes and edges instead`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Extract edges from dagitty DSL */
export function parseDagittyEdges(dagitty: string): string[] {
  const edges: string[] = [];
  const lines = dagitty.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match "a -> b" or "a <-> b"
    const match = trimmed.match(/^(\w+)\s*<?->\s*(\w+)/);
    if (match) {
      edges.push(`${match[1]} -> ${match[2]}`);
    }
  }
  return edges;
}
