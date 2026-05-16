# ADR-005: Defer Trust Tier System to v0.2.0

## Status

Accepted

## Context and Problem Statement

DAGpedia intends to implement a three-tier trust system for DAG contributions:

- **Verified** — submitted and endorsed by the original study authors
- **Reviewed** — reviewed and approved by community experts via PR
- **Community** — submitted but not yet reviewed

This system is important for quality assurance and for helping users assess
the reliability of any given DAG. The question is whether it is necessary
for the initial v0.1.0 release.

## Considered Options

- Implement tier system in v0.1.0 — all DAGs are classified from day one
- Defer to v0.2.0 — launch without tiers, add once community contributions begin

## Decision Outcome

Chosen option: **Defer to v0.2.0**

The tier system is a community governance mechanism. At v0.1.0, DAGpedia will
contain 1–2 seed DAGs authored by the project maintainer. In this state:

- All DAGs are effectively "Verified" by definition (the submitter is the
  same person as the maintainer and the original researcher)
- There are no external contributors to distinguish between
- Implementing the UI, labels, and review workflow for tiers adds engineering
  overhead with no observable benefit at this stage

The tier system should be introduced when the first external contributor
submits a DAG, at which point the distinction between tiers becomes meaningful.

### Consequences

- Good: Reduces v0.1.0 scope to the absolute minimum, enabling an earlier
  release
- Good: Tier definitions can be refined based on real contribution patterns
  rather than hypothetical ones
- Bad: If an external contributor submits a DAG before v0.2.0 is released,
  there is no formal review process in place — mitigated by PR review

## References

- Related: ADR-006 (LLM validation as a component of the review pipeline)
