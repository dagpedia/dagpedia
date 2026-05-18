---
date: '2026-05-16'
sequence: 3
title: DAG Format — DAGitty
status: accepted
tags:
- dag
- dagitty
---

# DAG Format — DAGitty


## Context and Problem Statement

DAGs in DAGpedia must be stored in a machine-readable, interoperable format.
The format must support interactive rendering in the browser, be widely
understood in the epidemiology community, and allow programmatic analysis
(identification of adjustment sets, d-separation queries, etc.).

## Considered Options

- DAGitty string format — Plain-text representation used by dagitty.net and
  the `dagitty` R package
- JSON-LD / custom JSON schema — Flexible but requires a custom parser and
  renderer
- DOT (Graphviz) — Widely used in software engineering; limited epidemiology
  tooling
- PNG/SVG image — Human-readable but not machine-actionable

## Decision Outcome

Chosen option: **DAGitty string format**

DAGitty is the de facto standard for causal DAGs in epidemiology. It is
supported by dagitty.net (browser-based editor), the `dagitty` R package, and
the `ggdag` R package. A large proportion of published epidemiology DAGs were
created in DAGitty, making re-encoding straightforward. The format renders
interactively in the browser via dagitty.js with no additional build step.

### Consequences

- Good: Native interactivity via dagitty.js — no custom renderer needed
- Good: Direct compatibility with the R ecosystem (`dagitty`, `ggdag`)
- Good: Researchers can copy DAGitty strings directly into their analyses
- Good: Largest existing corpus of published DAGs uses this format
- Bad: DAGitty format is not a formal standard and is controlled by a single
  maintainer; future format changes could require migration
- Bad: Limited expressiveness for time-varying DAGs or multilevel structures

## References

- Textor J et al. Robust causal inference using directed acyclic graphs:
  the R package 'dagitty'. Int J Epidemiol. 2016;45(6):1887–1894.
  https://doi.org/10.1093/ije/dyw341
- https://dagitty.net
