---
id: ses-cvd-classic
title: "Socioeconomic status → cardiovascular disease"
version: "0.1.0"
status: draft

field: social-epidemiology
subfield: cardiovascular

exposure: socioeconomic_status
outcome: cardiovascular_disease

dagitty: |
  dag {
    SES [exposure, pos="0,1"]
    CVD [outcome, pos="4,1"]
    Age [pos="2,0"]
    Smoking [pos="1,2"]
    PhysicalActivity [pos="3,2"]
    StressPathways [pos="2,1"]

    SES -> CVD
    SES -> Smoking
    SES -> PhysicalActivity
    SES -> StressPathways
    Smoking -> CVD
    PhysicalActivity -> CVD
    StressPathways -> CVD
    Age -> SES
    Age -> CVD
    Age -> Smoking
  }

edges:
  - from: SES
    to: CVD
    evidence: moderate
    notes: "Direct pathway; biological mechanisms include chronic stress, material deprivation"
  - from: SES
    to: Smoking
    evidence: strong
    notes: "Robust across many settings and populations"
  - from: SES
    to: PhysicalActivity
    evidence: moderate
    notes: "Leisure-time physical activity; occupational activity may differ"
  - from: SES
    to: StressPathways
    evidence: moderate
    notes: "Allostatic load, HPA axis dysregulation"
  - from: Smoking
    to: CVD
    evidence: strong
    notes: "Bradford Hill criteria satisfied"
  - from: PhysicalActivity
    to: CVD
    evidence: strong
    notes: "Protective; dose-response established"
  - from: StressPathways
    to: CVD
    evidence: moderate
    notes: "Neuroendocrine and inflammatory mechanisms"
  - from: Age
    to: SES
    evidence: weak
    notes: "Age affects SES accumulation over life course; direction debated"
  - from: Age
    to: CVD
    evidence: strong
  - from: Age
    to: Smoking
    evidence: weak

adjustment_set: [Age, Smoking, PhysicalActivity]
identification: backdoor

tags: [classic, confounding, backdoor, social-determinants, ICE]

related_dags:
  - id: ses-mental-health
    relation: shared_exposure
  - id: smoking-cvd
    relation: subgraph

publications:
  - doi: 10.1093/aje/kwt172
    notes: "Galea 2013 — consequentialist epidemiology framing"
  - doi: 10.1136/jech.2004.023705
    notes: "Krieger — ecosocial theory and SES-CVD"

contributors:
  - github: tetra4rnav

date_created: 2026-05-12
date_updated: 2026-05-12
---

## Background

Socioeconomic status (SES) is one of the most robust predictors of cardiovascular disease (CVD) across populations and settings. Lower SES is associated with higher CVD incidence and mortality, and this relationship persists after adjustment for conventional risk factors — suggesting both direct pathways (e.g., material deprivation, chronic stress) and indirect pathways through behavioral intermediaries.

This DAG represents a *domain-level* causal structure intended as a starting point for study-specific derivation. Researchers should add design-specific nodes (selection, measurement, timing) when deriving a study-specific DAG.

## Causal structure

```dagitty
dag {
  SES [exposure, pos="0,1"]
  CVD [outcome, pos="4,1"]
  Age [pos="2,0"]
  Smoking [pos="1,2"]
  PhysicalActivity [pos="3,2"]
  StressPathways [pos="2,1"]

  SES -> CVD
  SES -> Smoking
  SES -> PhysicalActivity
  SES -> StressPathways
  Smoking -> CVD
  PhysicalActivity -> CVD
  StressPathways -> CVD
  Age -> SES
  Age -> CVD
  Age -> Smoking
}
```

The key structural features are:

- **SES → CVD direct path**: material deprivation, neighborhood environment, healthcare access
- **SES → Smoking → CVD**: behavioral intermediary; note this is a *mediator* not a confounder if the research question is total effect of SES
- **SES → PhysicalActivity → CVD**: behavioral intermediary
- **Age** as a common cause of SES (life course accumulation) and CVD

## Assumptions

**Included:**

- Smoking and physical activity are on the causal pathway from SES to CVD (mediators), but they are also influenced by age independently. The adjustment decision depends on the estimand: total effect vs. direct effect of SES.
- Age is placed as a cause of SES to capture life course SES accumulation. In cross-sectional data, this arrow is often omitted.

**Intentionally omitted:**

- Race/ethnicity: a major modifier and upstream cause of SES in US contexts. Including it would require a separate DAG or a context-specific variant.
- Diet, alcohol: downstream of SES and on the causal pathway; omitted for parsimony.
- Healthcare access: mediator; can be added as explicit node if of interest.
- Sex/gender: similar to race/ethnicity — important modifier, context-dependent.

## Identification strategy

If the estimand is the **total effect** of SES on CVD:

- Adjustment set: `{Age}` only
- Smoking and PhysicalActivity are mediators — conditioning on them blocks part of the causal path

If the estimand is the **direct effect** of SES on CVD (not through behavioral intermediaries):

- Adjustment set: `{Age, Smoking, PhysicalActivity, StressPathways}`
- Note: adjusting for mediators introduces potential collider bias if the mediators share unmeasured common causes with CVD

In both cases, backdoor criterion is satisfied with the listed adjustment sets.

## Known variants

**US context with race/ethnicity:**
Add `Race` as a cause of SES and CVD. This changes the adjustment set and requires careful consideration of whether Race is a cause or a proxy for structural racism.

**Life course approach:**
Split SES into childhood SES and adult SES, with `ChildhoodSES → AdultSES` and both affecting CVD. Changes interpretation substantially.

**Mediator-as-confounder:**
If Smoking has independent causes that also affect CVD (unmeasured confounders), adjusting for Smoking in a mediation analysis introduces collider bias.

## Open questions

- The arrow `Age → SES` is contested. In some frameworks, Age is a proxy for cohort effects, not a cause.
- The `StressPathways` node is highly aggregate. Disaggregating into allostatic load, cortisol dysregulation, and inflammatory markers may be warranted for mechanistic research.
- Evidence level for `SES → CVD` direct path is *moderate*: while observational evidence is robust, the mechanism is not fully established.
