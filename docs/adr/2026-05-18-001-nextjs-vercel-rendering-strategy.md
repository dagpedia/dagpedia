---
date: '2026-05-18'
sequence: 1
title: Next.js + Vercel hybrid rendering strategy
status: accepted
tags:
  - site
  - nextjs
  - vercel
supersedes:
  - 2026-05-16-007-mkdocs-awesome-pages
---

# Next.js + Vercel hybrid rendering strategy

## Context and Problem Statement

DAGpedia was originally built on MkDocs + GitHub Pages as a static documentation site.
As the feature set grew to include interactive DAG visualization, a Node Library, and
future web-based contribution UIs, a more capable framework was needed.

The key question was whether the new site should be purely static or dynamic.

## Considered Options

- **Pure static site (SSG only)** — Pre-render everything at build time; no server runtime
- **Fully dynamic (SSR)** — Server-render on every request
- **Hybrid (SSG + ISR + API Routes)** — Static pages by default; selective revalidation and server endpoints where needed

## Decision Outcome

Chosen option: **Hybrid — Next.js (App Router) deployed on Vercel**

| Page | Strategy | Rationale |
|------|----------|-----------|
| `/dags/[slug]` | SSG | Pre-rendered from markdown at build time; CDN-served |
| `/nodes/[slug]` | SSG + ISR | Revalidated when node library is updated |
| `/dags` (catalog) | SSG | Static list rebuilt on each deploy |
| Future contribution UI | API Routes (SSR) | Needs server-side validation and GitHub API calls |

This approach is effectively "a static site with the option to add dynamic features,"
which matches DAGpedia's current needs without over-engineering.

### Consequences

- Good: Fast page loads via CDN; no runtime server costs for read paths
- Good: API Routes available for future contribution workflows (GitHub PR creation)
- Bad: Build times increase as the DAG library grows (mitigated by ISR)
- Bad: Requires Node.js build environment (not a plain file server)

## References

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Vercel deployment documentation](https://vercel.com/docs)
