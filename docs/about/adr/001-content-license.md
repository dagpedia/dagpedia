# ADR-001: Content License — CC BY 4.0

## Status

Accepted

## Context and Problem Statement

DAGpedia's core value is sharing and evolving causal DAGs across the research
community. The content (DAG files, annotations, evidence grades) needs a license
that encourages reuse, adaptation, and redistribution while maintaining
attribution to contributors. At the same time, many source DAGs are derived
from paywalled papers, raising copyright concerns.

## Considered Options

- CC BY 4.0 — Attribution required; sharing, adaptation, and commercial use permitted
- CC BY-SA 4.0 — Attribution + share-alike; derivatives must use the same license
- CC BY-NC 4.0 — Attribution + non-commercial only
- CC0 — Public domain dedication; no attribution required

## Decision Outcome

Chosen option: **CC BY 4.0**

CC BY 4.0 best reflects the philosophy of the living DAGs framework: make
knowledge freely available, reusable, and adaptable, while ensuring contributors
receive credit for their work.

### Consequences

- Good: Maximum reuse — any researcher, tool, or platform can incorporate
  DAGpedia content with attribution
- Good: Consistent with academic norms around citation and credit
- Good: Compatible with downstream integration (e.g., epi-atlas)
- Bad: CC BY-SA would have ensured derivative databases remain open, but the
  share-alike clause would create barriers for researchers publishing in
  traditional journals

### Copyright boundary

CC BY 4.0 covers DAGpedia's *original contributions* — the dagitty encoding,
evidence grades, and annotations. It does not alter the copyright status of
source papers. The protection against copyright claims from paywalled papers
rests on the idea-expression dichotomy: causal structures (nodes and edges as
scientific knowledge) are not copyrightable. CONTRIBUTING.md requires
contributors to confirm they are encoding causal knowledge fresh in dagitty
format, not reproducing copyrighted figures.

## References

- https://creativecommons.org/licenses/by/4.0/
- Reynolds RJ. Am J Epidemiol. 2026;195(5):1365–1367.
  https://doi.org/10.1093/aje/kwag029
