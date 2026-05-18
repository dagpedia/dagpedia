---
date: '2026-05-18'
sequence: 5
title: Four principles for Node-DAG referential integrity
status: accepted
tags:
  - nodes
  - validation
related:
  - 2026-05-18-004-node-library-separation
---

# Four principles for Node-DAG referential integrity

## Context and Problem Statement

The Node Library and DAG collection are separate files in a Git repository.
There is no database to enforce foreign key constraints. Without explicit rules,
node deletions or ID changes would silently break DAG references.

This ADR establishes the principles that govern how nodes may be changed,
and how the build system enforces consistency.

## Considered Options

- **No enforcement** — Rely on contributor discipline
- **Database foreign keys** — Requires a database; incompatible with Git-based content
- **CI + build-time index** — Immutable IDs, deprecation, aliases, full-scan validation

## Decision Outcome

Chosen option: **Four principles enforced by CI and build-time index**

**Principle 1 — Node IDs are immutable.** Once registered, a node's `id` must never change.
If a rename is needed, register a new node and deprecate the old one (Principle 2).
CI rejects any PR that modifies an existing node's `id` field.

**Principle 2 — Deprecation over deletion.** Node files must never be deleted.
Mark obsolete nodes with:

```yaml
status: deprecated
superseded_by: new-node-id
deprecated_at: "YYYY-MM-DD"
```

CI rejects any PR that removes a node file referenced by one or more DAGs.

**Principle 3 — Aliases absorb rename needs:**

```yaml
id: socioeconomic-status   # canonical ID
aliases: [ses, SES]        # old IDs still resolve
```

DAGs referencing any alias resolve to the canonical ID at build time.

**Principle 4 — Build-time full scan.** At every build, `src/lib/content-index.ts` scans
`src/content/nodes/` and `src/content/dags/` and generates:

```
nodeMap:    { id → NodeEntry }
aliasMap:   { alias → canonical id }
dagsByNode: { node id → DAG[] }
```

This index powers node pages, CI validation, and broken-reference detection.

### Consequences

- Good: DAG references never break silently — CI catches violations before merge
- Good: The four principles are simple enough to communicate to external contributors
- Bad: The node library grows monotonically (deprecated nodes are never removed)
- Bad: Full-scan index generation time increases with library size (acceptable at current scale)

## References

- `scripts/nodes/validate_nodes.py` — node validation
- `scripts/dag/validate_dag.py` — DAG node reference validation
