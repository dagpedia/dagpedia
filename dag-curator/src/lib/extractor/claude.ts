/**
 * Claude API wrapper for DAG extraction.
 * Uses prompt caching for the system prompt (cost optimization).
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ExtractionResult } from "@/types/curator";
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, PROMPT_VERSION } from "./prompts";
import { toKebabCase } from "@/lib/utils";

// The model to use for extraction (configurable via env)
const EXTRACTION_MODEL =
  (process.env.ANTHROPIC_MODEL as string | undefined) ?? "claude-opus-4-7";

// Zod schema for LLM output validation
const extractionSchema = z.object({
  dag_id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(80),
  dagitty: z.string().min(10),
  evidence: z.record(z.string(), z.string()),
  context: z.object({
    population: z.string(),
    geographic: z.string(),
    era: z.string(),
    note: z.string().optional(),
  }),
  keywords: z.array(z.string()).min(1),
  body: z.string(),
});

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function extractDagFromText(
  paperText: string,
  doi?: string
): Promise<ExtractionResult | null> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Cache the system prompt — saves ~60% on long sessions
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: USER_PROMPT_TEMPLATE(paperText, doi),
      },
    ],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Handle "cannot extract" responses
  const trimmed = rawText.trim();
  if (trimmed === "null" || trimmed.toLowerCase().includes("cannot identify")) {
    return null;
  }

  // Extract JSON from response (handle ```json ... ``` fences)
  let jsonStr = trimmed;
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${jsonStr.slice(0, 200)}`);
  }

  const validated = extractionSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `LLM output failed validation: ${validated.error.message}`
    );
  }

  const data = validated.data;

  return {
    dagId: toKebabCase(data.dag_id),
    title: data.title,
    dagitty: data.dagitty,
    evidence: data.evidence,
    context: data.context,
    keywords: data.keywords,
    body: data.body,
    model: EXTRACTION_MODEL,
    promptVersion: PROMPT_VERSION,
  };
}

export async function extractDagFromPaper(opts: {
  abstract?: string;
  fullText?: string;
  doi?: string;
  title?: string;
}): Promise<ExtractionResult | null> {
  const { abstract, fullText, doi, title } = opts;

  // Build best available text
  let paperText = "";
  if (title) paperText += `Title: ${title}\n\n`;
  if (abstract) paperText += `Abstract:\n${abstract}\n\n`;
  if (fullText) paperText += `Full text (excerpt):\n${fullText}`;

  if (!paperText.trim()) {
    throw new Error("No paper text provided for extraction");
  }

  // Limit input to ~6000 chars to manage context + cost
  paperText = paperText.slice(0, 6000);

  return extractDagFromText(paperText, doi);
}
