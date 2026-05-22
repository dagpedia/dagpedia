---
id: ses-cvd-classic
title: Socioeconomic Status and Cardiovascular Disease
context:
  population: general-adults
  geographic: global
  era: 1990s-present
dagitty: |
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
evidence:
  socioeconomic_status -> healthcare_access: strong
  socioeconomic_status -> health_behaviors: strong
  socioeconomic_status -> psychosocial_stress: strong
  healthcare_access -> cardiovascular_disease: strong
  health_behaviors -> cardiovascular_disease: strong
  psychosocial_stress -> cardiovascular_disease: moderate
  socioeconomic_status -> cardiovascular_disease: moderate
  age -> socioeconomic_status: strong
  age -> cardiovascular_disease: strong
  sex -> socioeconomic_status: moderate
  sex -> cardiovascular_disease: strong
keywords:
  - social-determinants
  - cardiovascular
  - classic
  - ses
  - health-behaviors
  - psychosocial
alternatives: []
---

## Operationalization

- **socioeconomic_status**: Income, education, occupation, or composite SES index.
- **cardiovascular_disease**: Incident CVD events or mortality (study-specific definition).
- **healthcare_access**: Insurance, utilization, or quality of care proxies.
- **health_behaviors**: Aggregated smoking, diet, physical activity.
- **psychosocial_stress**: Chronic stress, allostatic load, or related constructs.
- **age**, **sex**: Standard demographic covariates.

## Edge rationale

SES is one of the most robust predictors of CVD. Pathways through healthcare access, behaviors, and psychosocial stress are well documented; a direct residual path captures effects not mediated by these nodes.

- Marmot M. Social gradient in health. PMID: [15184295](https://pubmed.ncbi.nlm.nih.gov/15184295/)
- Havranek EP et al. Social determinants of CVD. DOI: [10.1056/NEJMra1511625](https://doi.org/10.1056/NEJMra1511625)
- Galea S. Consequentialist epidemiology framing. DOI: [10.1093/aje/kwt172](https://doi.org/10.1093/aje/kwt172)
- Krieger N. Ecosocial theory and SES-CVD. DOI: [10.1136/jech.2004.023705](https://doi.org/10.1136/jech.2004.023705)

## Missing edge rationale

- Race/ethnicity, diet quality, and neighborhood environment are simplified or omitted for this domain-level DAG.
- Selection into healthcare utilization is not explicitly modeled.

## Context and reusability

Domain-level structure for study-specific derivation. Add design-specific nodes (selection, measurement, timing) when adapting to a cohort.

## Known limitations

- `health_behaviors` and `psychosocial_stress` are aggregates; disaggregation may change adjustment advice.
- Direct SES→CVD path interpretation depends on mediator adjustment choices.
- Cross-national comparability of SES measures varies.
