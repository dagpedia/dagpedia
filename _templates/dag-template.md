---
id: your-dag-id
title: "Exposure and outcome"
context:
  population: general-adults
  geographic: north-america-europe
  era: 1990s-present
  # note: "Optional scope note, max 200 chars"
dagitty: |
  dag {
    exposure_node [exposure]
    outcome_node [outcome]
    confounder -> exposure_node
    confounder -> outcome_node
    exposure_node -> outcome_node
  }
evidence:
  exposure_node -> outcome_node: moderate
  confounder -> exposure_node: moderate
  confounder -> outcome_node: moderate
keywords:
  - smoking
alternatives: []
---

## Operationalization

Define how each node is measured in practice.

## Edge rationale

Explain edges with moderate or weaker evidence. Place DOI/PMID citations here.

## Missing edge rationale

Document edges intentionally omitted and why.

## Context and reusability

Describe limits of `context` and when edge interpretations may change.

## Known limitations

Unmeasured confounding, scope limits, and generalizability concerns.
