---
id: ses-cvd-classic
title: Socioeconomic Status and Cardiovascular Disease
exposure: socioeconomic_status
outcome: cardiovascular_disease
nodes:
  - key: socioeconomic_status
  - key: cardiovascular_disease
  - key: healthcare_access
  - key: health_behaviors
  - key: psychosocial_stress
  - key: age
  - key: sex
evidence_level: strong
version: 1.0.0
authors:
  - dagpedia
created_at: "2026-05-18"
updated_at: "2026-05-18"
references:
  - pmid: "15184295"
    label: "Marmot 2004 - Social gradient in health"
  - doi: "10.1056/NEJMra1511625"
    label: "Havranek et al. 2015 - Social determinants of CVD"
  - doi: "10.1093/aje/kwt172"
    label: "Galea 2013 — consequentialist epidemiology framing"
  - doi: "10.1136/jech.2004.023705"
    label: "Krieger — ecosocial theory and SES-CVD"
related_dags: []
tags: [social-determinants, cardiovascular, classic]
---

## Background

Socioeconomic status (SES) is one of the most robust predictors of cardiovascular disease (CVD) across populations and settings. Lower SES is associated with higher CVD incidence and mortality, and this relationship persists after adjustment for conventional risk factors — suggesting both direct pathways (e.g., material deprivation, chronic stress) and indirect pathways through behavioral intermediaries.

This DAG represents a *domain-level* causal structure intended as a starting point for study-specific derivation. Researchers should add design-specific nodes (selection, measurement, timing) when deriving a study-specific DAG.

The relationship operates through multiple pathways including differential access to healthcare, health behaviors, and chronic psychosocial stress.

## DAG

```dagitty
dag {
  socioeconomic_status [exposure]
  cardiovascular_disease [outcome]

  socioeconomic_status -> healthcare_access
  socioeconomic_status -> health_behaviors
  socioeconomic_status -> psychosocial_stress
  healthcare_access -> cardiovascular_disease
  health_behaviors -> cardiovascular_disease
  psychosocial_stress -> cardiovascular_disease
  socioeconomic_status -> cardiovascular_disease
  age -> socioeconomic_status
  age -> cardiovascular_disease
  sex -> socioeconomic_status
  sex -> cardiovascular_disease
}
```

## Notes

- `health_behaviors` aggregates smoking, diet, physical activity
- `psychosocial_stress` includes chronic stress and allostatic load
- Direct path `ses → cvd` represents residual direct effect
- Race/ethnicity, diet, and healthcare access variants are intentionally simplified for this domain-level DAG
