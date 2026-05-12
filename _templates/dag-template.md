---
# ── Required fields ──────────────────────────────────────────────────────────
id: your-dag-id                    # unique slug, matches filename
title: "Exposure → Outcome"        # display title
version: "0.1.0"                   # semver
status: draft                      # draft | review | stable

field: epidemiology                # epidemiology | social-epidemiology | ...
subfield: ""                       # e.g. cardiovascular, mental-health, ...

exposure: exposure_variable        # standardized slug
outcome: outcome_variable          # standardized slug

dagitty: |
  dag {
    Exposure [pos="0,1"]
    Outcome [pos="2,1"]
    Confounder [pos="1,0"]

    Exposure -> Outcome
    Confounder -> Exposure
    Confounder -> Outcome
  }

edges:
  - from: Exposure
    to: Outcome
    evidence: speculative          # speculative | weak | moderate | strong
    notes: ""
  - from: Confounder
    to: Exposure
    evidence: speculative
    notes: ""
  - from: Confounder
    to: Outcome
    evidence: speculative
    notes: ""

adjustment_set: [Confounder]       # minimum sufficient adjustment set
identification: backdoor           # backdoor | frontdoor | iv | unidentified | unknown

# ── Optional fields ───────────────────────────────────────────────────────────
tags: []

related_dags: []
# Example:
# - id: other-dag-id
#   relation: shared_exposure      # shared_exposure | shared_outcome |
#                                  # subgraph | supergraph |
#                                  # structural_variant | competing

publications: []
# Example:
# - doi: 10.1093/aje/kwt172
#   notes: "Foundational paper establishing this causal pathway"

contributors:
  - github: your-github-username

date_created: 2026-05-12
date_updated: 2026-05-12
---

## Background

<!-- Why does this causal question matter? What is the public health or scientific relevance? -->

## Causal structure

<!-- What does this DAG encode? Describe the key nodes and edges in plain language. -->

```dagitty
dag {
  Exposure [pos="0,1"]
  Outcome [pos="2,1"]
  Confounder [pos="1,0"]

  Exposure -> Outcome
  Confounder -> Exposure
  Confounder -> Outcome
}
```

## Assumptions

<!-- What are the key assumptions embedded in this DAG?
     What has been intentionally omitted, and why? -->

## Identification strategy

<!-- How can the causal effect be estimated given this structure?
     What is the minimum adjustment set? Are there multiple valid sets? -->

## Known variants

<!-- Are there alternative DAG structures for this research question?
     Under what conditions would a different structure apply? -->

## Open questions

<!-- What edges are most uncertain? What empirical evidence would change this DAG? -->
