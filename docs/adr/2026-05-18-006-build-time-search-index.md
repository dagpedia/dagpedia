---
date: '2026-05-18'
sequence: 6
title: Build-time static search index generation
status: accepted
tags:
  - search
related:
  - 2026-05-18-007-command-palette-search-ux
---

# Build-time static search index generation

## Context and Problem Statement

DAGpedia needs a search feature that covers both DAGs and nodes.

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| MkDocs built-in search | Zero configuration | Lost after Next.js migration |
| Algolia / external search API | Powerful | External dependency, cost, privacy |
| Client-side full-text (Fuse.js) | No server | Large bundle if index is big |
| Build-time JSON + client-side filter | Static, fast, no external deps | Index must be regenerated on deploy |

## Decision Outcome

Chosen option: **Build-time JSON + client-side filter**

Generate `/public/search-index.json` at build time via a prebuild script
(`scripts/generate-search-index.ts`), and load it client-side in the
`SearchCommand` component on first dialog open.

```json
[
  { "type": "dag",  "id": "smoking-lung-cancer", "title": "...", "exposure": "...", "outcome": "...", "tags": [...] },
  { "type": "node", "id": "smoking", "label": "Smoking", "category": "behavioral" }
]
```

- **Generation**: `tsx scripts/generate-search-index.ts` runs as `prebuild` in `package.json`
- **Filtering**: shadcn/ui `Command` component (backed by `cmdk`) handles fuzzy filtering client-side
- **Caching**: The fetched array is cached in module scope after first load
- **Git**: `public/search-index.json` is added to `.gitignore` (build artifact)

If the library grows beyond ~2,000 entries, evaluate Pagefind or Algolia.

### Consequences

- Good: No external search service; works offline and on Vercel free tier
- Good: Index is always consistent with content (regenerated on every deploy)
- Good: `cmdk` fuzzy search is fast enough for expected library size (hundreds of entries)
- Bad: Search index is not available until first `⌘K` open (fetch on demand)
- Bad: Does not support full-text search of DAG narrative content (frontmatter fields only)

## References

- `scripts/generate-search-index.ts`
- `src/components/layout/SearchCommand.tsx`
