---
date: '2026-05-18'
sequence: 3
title: Markdown + YAML frontmatter for DAGs and nodes
status: accepted
tags:
  - content
  - markdown
related:
  - 2026-05-18-005-node-dag-referential-integrity
---

# Markdown + YAML frontmatter for DAGs and nodes

## Context and Problem Statement

DAGpedia is a community-maintained library. The content format must be:

- Easy to contribute to via GitHub pull requests (including GitHub's web UI editor)
- Machine-parseable for build-time index generation and validation
- Expressive enough to capture DAG structure, metadata, and narrative text

## Considered Options

- `.md` + YAML frontmatter
- `.yaml` only (no narrative body)
- `.json` only
- `.mdx` (Markdown + JSX)

## Decision Outcome

Chosen option: **`.md` files with YAML frontmatter** for both DAG entries and Node Library entries.

- **YAML frontmatter**: all structured metadata (id, title, exposure, outcome, dag code,
  node references, evidence levels, version, authors, tags)
- **Markdown body**: narrative text (overview, assumptions, measurement considerations)

Parse with `gray-matter` + validate with `zod` schemas at build time.

**DAG file example (abbreviated):**

```yaml
---
id: smoking-lung-cancer
title: "Smoking and lung cancer"
exposure: smoking
outcome: lung-cancer
tier: verified
version: "3.0.0"
tags: [smoking, respiratory]
dag: |
  dag {
    smoking -> lung_cancer
    smoking -> pack_years
    pack_years -> lung_cancer
    age -> lung_cancer
    age -> smoking
  }
---
```

**Node file example (abbreviated):**

```yaml
---
id: smoking
label: Smoking
category: behavioral
data_type: binary
aliases: [cigarette smoking, tobacco use]
---
```

### Consequences

- Good: GitHub web UI can edit `.md` files directly — low barrier to contribution
- Good: Pull request workflow maps naturally to the Living DAGs review/ratification cycle
- Good: Markdown body allows rich narrative without additional tooling
- Bad: No referential integrity at the file level (enforced separately via CI — see `2026-05-18-005-node-dag-referential-integrity`)
- Bad: YAML multiline strings (for dagitty code) require care to avoid indentation errors

## References

- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [Zod](https://zod.dev/)
