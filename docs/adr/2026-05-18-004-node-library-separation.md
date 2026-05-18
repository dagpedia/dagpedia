---
date: '2026-05-18'
sequence: 4
title: Node Library as a separate content collection
status: accepted
tags:
  - nodes
  - content
related:
  - 2026-05-18-003-content-format
  - 2026-05-18-005-node-dag-referential-integrity
---

# Node Library as a separate content collection

## Context and Problem Statement

Each DAG references multiple variables (nodes). Without a shared registry, the same
variable (e.g., "SES", "Socioeconomic Status", "socioeconomic status") risks being
defined differently across DAGs, making cross-DAG queries and the `/nodes/[slug]` page
impossible to implement reliably.

## Considered Options

- **Inline node definitions in DAG files** — Single file per DAG; risk of definition drift
- **Separate Node Library collection** — Canonical node registry; DAGs reference by ID only

## Decision Outcome

Chosen option: **Separate Node Library** at `src/content/nodes/`, distinct from `src/content/dags/`.

- DAG files do **not** define nodes inline. They reference nodes by canonical ID only.
- Node definitions (label, aliases, category, data type, measurement examples) live
  exclusively in `src/content/nodes/[id].md`.
- The build-time content index (`src/lib/content-index.ts`) generates a bidirectional map:
  - `nodeMap`: `{ id → NodeEntry }`
  - `dagsByNode`: `{ node id → DAG[] }` — powers the "DAGs using this node" section

**Contribution model:**

| PR type | Target | Validation |
|---------|--------|------------|
| Node registration | `src/content/nodes/xxx.md` | No duplicate ID; required fields present |
| DAG submission | `src/content/dags/xxx.md` | All referenced node IDs exist in library or same PR |

A node registration PR and a DAG submission PR may be opened simultaneously.
The CI validator accepts node IDs that appear in the same PR as the DAG being validated.

### Consequences

- Good: Eliminates definition drift across DAGs
- Good: Enables `/nodes/[slug]` pages with automatic "used in N DAGs" cross-referencing
- Good: Single source of truth for variable labels, aliases, and categories
- Bad: Adding a new DAG with new variables requires two files (node + DAG)
- Bad: CI validator complexity increases (must resolve same-PR additions)

## References

- `src/lib/content-index.ts` — build-time bidirectional index
