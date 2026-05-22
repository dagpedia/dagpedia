---
id: smoking-lung-cancer
title: Smoking and lung cancer
context:
  population: general-adults
  geographic: north-america-europe
  era: 1990s-present
dagitty: |
  dag {
    smoking [exposure]
    lung_cancer [outcome]
    age -> smoking
    age -> lung_cancer
    sex -> smoking
    sex -> lung_cancer
    smoking -> lung_cancer
    smoking -> pack_years
    pack_years -> lung_cancer
    asbestos -> lung_cancer
    genetic_risk -> lung_cancer
  }
evidence:
  smoking -> lung_cancer: strong
  smoking -> pack_years: strong
  pack_years -> lung_cancer: strong
  age -> lung_cancer: strong
  age -> smoking: moderate
  sex -> smoking: moderate
  sex -> lung_cancer: moderate
  asbestos -> lung_cancer: strong
  genetic_risk -> lung_cancer: moderate
keywords:
  - smoking
  - lung-cancer
  - mediation
  - respiratory
alternatives: []
---

## Operationalization

- **smoking**: Current or former cigarette smoking status (ever/never or current/former).
- **pack_years**: Cumulative dose (packs per day × years smoked).
- **lung_cancer**: Incident lung cancer (histology-specific variants may be added in study-specific DAGs).
- **age**, **sex**: Standard demographic covariates.
- **asbestos**: Occupational or environmental asbestos exposure.
- **genetic_risk**: Family history or polygenic risk score for lung cancer.

## Edge rationale

The smoking–lung cancer association is supported by extensive observational and mechanistic evidence. Pack-years mediates part of the effect through cumulative dose.

- Reynolds RJ. Living DAGs: the future of DAGs in epidemiology. *Am J Epidemiol*. 2026. DOI: [10.1093/aje/kwag029](https://doi.org/10.1093/aje/kwag029)

Moderate evidence for age and sex effects on smoking reflects heterogeneity across populations and eras.

## Missing edge rationale

- No direct edge from asbestos or genetic risk to smoking (assumed independent in this domain-level DAG).
- Radon, air pollution, and occupational exposures other than asbestos are omitted for scope.

## Context and reusability

Intended for general adult populations in North America and Europe from the 1990s onward. Occupational cohorts may require an asbestos–smoking interaction or different asbestos operationalization.

## Known limitations

- Unmeasured confounding between pack-years and lung cancer is possible.
- Genetic risk and asbestos may correlate with SES in some settings (not modeled here).
- Generalization outside the declared context may weaken edge interpretations.
