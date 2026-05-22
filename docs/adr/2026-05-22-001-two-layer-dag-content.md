---
date: '2026-05-22'
sequence: 1
title: Two-layer DAG content — contributor MD and generated JSON
status: accepted
tags:
  - content
  - architecture
  - ci
related:
  - 2026-05-16-003-dag-format-dagitty
  - 2026-05-18-003-content-format
  - 2026-05-18-005-node-dag-referential-integrity
  - 2026-05-18-006-build-time-search-index
---

# Two-layer DAG content — contributor MD and generated JSON

## Context and Problem Statement

DAG entries were stored as a single Markdown file mixing:

- Contributor-authored content (dagitty structure, per-edge evidence, narrative)
- Git-managed metadata (version, dates, contributors)
- System-derived fields (adjustment sets, conditional independencies, node roles)
- Duplicated or ambiguous fields (`nodes` list vs dagitty graph, `edges` vs dagitty edges)

This caused manual sync cost, unclear ownership boundaries, and validation split across Python CI and Node prebuild (`public/dag-meta/`, gitignored).

[Issue #52](https://github.com/dagpedia/dagpedia/issues/52) proposes separating **human-edited source** from **machine-generated artifacts** while keeping `src/content/dags/` as the contributor path (not `docs/dags/`).

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| Single `.md` (status quo) | One file per DAG | Mixed concerns; derived fields drift or duplicate |
| `docs/dags/` + `_data/` (Issue literal paths) | Matches upstream issue text | Breaks established `src/content/dags/` + co-located app loaders |
| `src/content/dags/` + `_data/` (chosen) | Minimal path churn; same PR workflow | Differs from issue directory names |
| R / `dagitty` package in CI for derivation | Reference implementation in epidemiology tooling | Extra runtime in CI; repo already ships vendored `dagitty.js` |
| `dagitty.js` in Node for derivation (chosen) | Reuses `computeDagMeta`, one language in generate step | Must keep JS analyzer aligned with dagitty semantics |
| Build-only JSON in `public/` (previous) | No bot commits | Not reviewable in PR; easy to forget locally |

## Decision Outcome

Chosen option: **`src/content/dags/<id>.md` (contributor) + `_data/<id>.json` (CI-generated, committed)**

### Layer 1 — Contributor Markdown

Path: `src/content/dags/<id>.md`

**Frontmatter (strict, enum-backed):**

- `id`, `title`
- `context`: `population`, `geographic`, `era` (+ optional `note`) — enums in `docs/schema/`
- `dagitty`: pipe block — **sole source of truth** for graph structure
- `evidence`: map keyed `from -> to` (must match every dagitty edge)
- `keywords`, `alternatives` (list of existing DAG ids)

**Not in frontmatter:** `version`, `date`, `status`, `contributors`, `nodes`, `edges`, `adjustment_sets`, `tier`, `workflowStatus`. Git history and merge to `main` represent ratification.

**Dagitty attributes:** only dagitty-native tags (`[exposure]`, `[outcome]`, `[adjusted]`, `[latent]`, `[selected]`, `[pos="x,y"]`). Roles such as mediator are **inferred** at generation time, not authored.

**Body:** recommended sections — Operationalization, Edge rationale (citations/DOI/PMID here), Missing edge rationale, Context and reusability, Known limitations. No ` ```dagitty ` fence in the body.

### Layer 2 — Generated JSON

Path: `_data/<id>.json` (committed; **contributors must not edit**)

Produced by `npm run generate-dag-data` (`scripts/generate-dag-data.ts`):

- Stable UUIDs for DAG, nodes, and edges (preserved across regenerations)
- `graph` (nodes with roles, edges with evidence, dagitty string)
- `computed` (adjustment sets, conditional independencies, counts) via **dagitty.js**
- `git.md_commit_sha` for the markdown file
- `llm.text` and `llm.edge_set_sorted` per `docs/schema/llm-text-format.md`

Schema: `docs/schema/dag-data.schema.json`, runtime validation: `src/lib/dag-data-schema.ts` (Zod).

### Runtime / UI

| Concern | Source |
|---------|--------|
| Canvas, panels, adjustment sets, CI list | `_data/<id>.json` via `loadDagData()` / `getDagPageData()` |
| Prose sections | Markdown body via `gray-matter` |
| Node display labels | `src/content/nodes/` (referential integrity unchanged) |
| Dagitty source panel | `_data.graph.dagitty` |
| Version / contributors UI | Git commit SHA + link to history (not duplicated in YAML) |

`public/dag-meta/` is superseded for DAG pages; prebuild runs `generate-dag-data` instead of `generate-dag-meta`.

### Validation and CI

- **Python:** `scripts/dag/validate_dag.py` — frontmatter, enums, dagitty parse, evidence ↔ edges, alternatives exist, node ids ⊆ node library
- **Node:** `generate-dag-data.ts --check` — committed `_data` matches deterministic regeneration
- **PR workflow:** `.github/workflows/validate-and-generate.yml` validates, regenerates `_data/*.json`, and bot-commits with `[skip ci]` when needed
- **Main CI:** `.github/workflows/ci.yml` runs validators + `--check` + `npm run build`

`.gitattributes` marks `_data/*.json` as linguist-generated.

### Deferred (follow-up)

- `deprecated/` markdown path + tombstone JSON + `GOVERNANCE.md`
- Git-log–based contributor display
- Full `react-markdown` + `rehype-highlight` for body (current: extended `MarkdownBody`)

### Consequences

- Good: Clear boundary — humans edit MD only; machines own `_data`
- Good: PRs show JSON diffs for structural/computed changes after bot commit
- Good: No duplicate `nodes`/`edges` lists; evidence enforced against dagitty
- Good: Reuses existing dagitty.js analyzer; no R dependency in CI
- Bad: Contributors must run or wait for CI to refresh `_data` (documented in CONTRIBUTING)
- Bad: Partial drift from Issue #52 paths (`docs/dags/` → `src/content/dags/`)
- Bad: `2026-05-18-003-content-format` frontmatter example is outdated; this ADR is the canonical DAG frontmatter contract going forward

## References

- GitHub Issue [#52](https://github.com/dagpedia/dagpedia/issues/52)
- `docs/schema/` enum definitions
- `scripts/generate-dag-data.ts`
- `scripts/dag/validate_dag.py`
- `.cursor/rules/dagpedia.mdc`
- `_templates/dag-template.md`
