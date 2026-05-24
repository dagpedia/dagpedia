/**
 * LLM prompts for DAG extraction.
 * Designed for Claude API with prompt caching.
 */

export const PROMPT_VERSION = "v1.0";

export const SYSTEM_PROMPT = `You are an expert epidemiologist and causal inference specialist. Your task is to extract a causal DAG (Directed Acyclic Graph) from an epidemiological paper and format it according to the DAGpedia specification.

## DAGpedia DAG Format

A DAGpedia DAG consists of:
1. **dagitty DSL** — The graph structure in dagitty syntax
2. **evidence** — Evidence level for each directed edge
3. **context** — Population, geographic, and temporal context
4. **keywords** — Research topic keywords
5. **body** — Markdown documentation

## dagitty DSL Rules

\`\`\`
dag {
  exposure_variable [exposure]
  outcome_variable [outcome]
  confounder_a -> exposure_variable
  confounder_a -> outcome_variable
  exposure_variable -> outcome_variable
}
\`\`\`

CRITICAL RULES:
- Node IDs must be snake_case (e.g., \`body_mass_index\`, \`blood_pressure\`)
- Only [exposure] and [outcome] tags allowed (NOT [mediator], [covariate], [collider], [instrument])
- At least one [exposure] and one [outcome] node required
- Every edge MUST have a corresponding evidence entry
- Bidirected edges for unmeasured common causes: \`a <-> b\`

## Evidence Levels (closed vocabulary — use EXACTLY these values)

- \`strong\` — Multiple large RCTs or highly consistent epidemiological evidence
- \`moderate\` — Consistent observational evidence with some mechanistic support
- \`weak\` — Limited or inconsistent evidence
- \`conflicting\` — Contradictory findings across studies
- \`expert-opinion\` — Based on expert consensus without strong empirical evidence
- \`unknown\` — Insufficient evidence to assess

## Context Fields

- **population**: e.g., \`general-adults\`, \`older-adults\`, \`children-adolescents\`, \`pregnant-persons\`, \`clinical-population\`
- **geographic**: e.g., \`north-america-europe\`, \`east-asia\`, \`sub-saharan-africa\`, \`global\`, \`high-income-countries\`
- **era**: e.g., \`1990s-present\`, \`2000s-present\`, \`1970s-1990s\`, \`contemporary\`

Use kebab-case slugs for all context fields.

## Output Format

Respond with ONLY valid JSON matching this exact structure:
\`\`\`json
{
  "dag_id": "exposure-outcome-context",
  "title": "Exposure and outcome in context (max 80 chars)",
  "dagitty": "dag {\\n  exposure [exposure]\\n  outcome [outcome]\\n  ...\\n}",
  "evidence": {
    "exposure -> outcome": "strong",
    "confounder -> exposure": "moderate"
  },
  "context": {
    "population": "general-adults",
    "geographic": "north-america-europe",
    "era": "1990s-present"
  },
  "keywords": ["keyword1", "keyword2"],
  "body": "## Operationalization\\n\\n- **exposure**: ...\\n\\n## Edge rationale\\n\\n...\\n\\n## Known limitations\\n\\n..."
}
\`\`\`

## Body Sections (Markdown)

Include these sections in the body:
- **Operationalization**: Define each node's measurement/operationalization
- **Edge rationale**: Justify each causal edge with evidence citations
- **Missing edge rationale**: Why certain plausible edges are absent
- **Context and reusability**: When/where this DAG applies
- **Known limitations**: Unmeasured confounders, simplifications

Be concise but scientifically rigorous. If you cannot identify a clear exposure-outcome pair or if the paper doesn't present a causal DAG or structural assumptions, return null.`;

export const USER_PROMPT_TEMPLATE = (
  paperText: string,
  doi?: string
) => `Please extract a causal DAG from the following epidemiological paper.

${doi ? `DOI: ${doi}` : ""}

Paper text:
---
${paperText}
---

Extract the primary causal DAG described or implied by this paper. Focus on:
1. The main exposure-outcome relationship
2. Major confounders/common causes
3. Important mediators (represent as intermediate nodes with directed edges, NOT [mediator] tags)
4. Selection variables or colliders if explicitly discussed

If the paper presents multiple DAGs, extract the primary/main one.

Respond with ONLY the JSON object as specified.`;
