---
date: '2026-05-16'
sequence: 7
title: MkDocs with awesome-pages for site generation
status: superseded
status_note: replaced by Next.js 15 on Vercel (2025)
superseded_by: 2026-05-18-001-nextjs-vercel-rendering-strategy
tags:
- site
- mkdocs
---

# MkDocs with awesome-pages for site generation


## Context and Problem Statement

DAGpedia requires a site generator that can render Markdown files as a
public website. The primary constraint is contributor experience: researchers
contributing DAGs should be able to do so by writing Markdown files and
submitting a pull request, without needing to understand a JavaScript
framework, run a Node.js build pipeline, or edit site configuration files.

Two sub-decisions are captured here:

1. Choice of site generator
2. Navigation management strategy

## Decision Drivers

- Contributor barrier must be minimal: write Markdown, submit PR, done
- Python ecosystem familiarity (target contributors are researchers, not
  frontend developers)
- DAG pages must support custom JavaScript (dagitty.js rendering)
- Navigation must scale without manual maintenance as DAGs are added

## Considered Options

### Site generator

- MkDocs with Material theme
- Docusaurus (Meta) — React-based, Node.js required
- Hugo — Go binary, fast, flexible
- VitePress — Vue-based, Node.js required
- Starlight (Astro) — Node.js required
- Zensical — built by the Material for MkDocs team; at v0.0.41, too early

### Navigation management

- Manual `nav:` in `mkdocs.yml` — explicit but requires editing on every
  DAG addition
- `mkdocs-awesome-pages-plugin` — order controlled via per-directory
  `.pages` files; `mkdocs.yml` never touched for nav changes
- No nav (pure auto-generation) — alphabetical, no order control

## Decision Outcome

Chosen options: **MkDocs with Material theme** + **awesome-pages plugin**

### Site generator rationale

MkDocs is the only major documentation site generator that:
- Requires only Python (already needed for DAG validation scripts)
- Has zero JavaScript build tooling for contributors
- Supports custom JavaScript injection (dagitty.js, dagitty-render.js)
- Is installable with a single `pip install`

Docusaurus, VitePress, and Starlight all require Node.js, which raises the
contribution barrier for researchers unfamiliar with the JavaScript ecosystem.
Hugo is a viable alternative but less familiar to the Python-oriented research
community.

Zensical was evaluated and noted as a future candidate. It is built by the
Material for MkDocs team and shares the same design philosophy. Migration
should be reconsidered when Zensical reaches v1.0.0.

### Navigation rationale

Manual `nav:` management in `mkdocs.yml` was rejected because every new DAG
would require a YAML edit — an unnecessary friction for contributors and a
source of merge conflicts. The awesome-pages plugin allows navigation order
to be controlled via lightweight `.pages` files placed in each directory,
keeping `mkdocs.yml` stable as the repository grows.

### ADR placement

ADRs are placed in `docs/about/adr/` and rendered as part of the public site.
This aligns with DAGpedia's commitment to transparency: design decisions are
part of the project's public epistemic record, consistent with the living
DAGs framework of making assumptions explicit and open to scrutiny.

### Consequences

- Good: Contributors only ever write Markdown and submit PRs
- Good: `mkdocs.yml` does not need to be edited when adding DAGs or ADRs
- Good: ADRs are publicly visible, supporting transparency
- Good: dagitty.js renders interactively without a build step
- Bad: MkDocs search (lunr.js) has limits at scale; may need replacement
  when DAG count reaches hundreds (see future consideration below)
- Bad: Zensical is not yet production-ready; migration deferred

### Future consideration

If faceted search (filter by exposure, outcome, evidence level) becomes a
hard requirement, the data layer (Markdown + YAML frontmatter) is portable.
The site generator can be replaced without changing the contribution workflow,
as long as the frontmatter schema remains stable.

## References

- https://www.mkdocs.org/
- https://squidfunk.github.io/mkdocs-material/
- https://github.com/lukasgeiter/mkdocs-awesome-pages-plugin
- https://zensical.org
