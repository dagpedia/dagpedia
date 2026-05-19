---
id: smoking-lung-cancer
title: "Smoking and lung cancer"
exposure: smoking
outcome: lung_cancer
tier: verified
dagType: domain-level
workflowStatus: ratified
evidence_level: strong
version: "3.0.0"
updated_at: "2026-03-01"
tags:
  - smoking
  - lung-cancer
  - mediation
  - respiratory
authors:
  - name: Reynolds RJ
    affiliation: UCF
contributors:
  - name: Sakamaki M
    initials: MS
    affiliation: JHSPH
references:
  - doi: "10.1093/aje/kwag029"
    label: "Reynolds RJ. Living DAGs: the future of DAGs in epidemiology. Am J Epidemiol. 2026;195:1365–1367."
alternativeDags:
  - slug: smoking-lung-cancer-direct
    title: "Smoking → Lung Cancer (direct only)"
    nodeCount: 5
    note: "No mediator"
  - slug: smoking-lung-cancer-radon
    title: "Smoking → Lung Cancer (with radon)"
    nodeCount: 8
    note: "Extended model"
nodes:
  - key: smoking
  - key: lung_cancer
  - key: pack_years
  - key: age
  - key: sex
  - key: asbestos
  - key: genetic_risk
edges:
  - from: smoking
    to: lung_cancer
    evidence: strong
  - from: smoking
    to: pack_years
    evidence: strong
  - from: pack_years
    to: lung_cancer
    evidence: strong
  - from: age
    to: lung_cancer
    evidence: strong
  - from: age
    to: smoking
    evidence: moderate
  - from: sex
    to: smoking
    evidence: moderate
  - from: sex
    to: lung_cancer
    evidence: moderate
  - from: asbestos
    to: lung_cancer
    evidence: strong
  - from: genetic_risk
    to: lung_cancer
    evidence: moderate
---

## Overview

This DAG represents the causal structure linking smoking to lung cancer, incorporating
pack-years as a mediator of cumulative dose, and age, sex, asbestos exposure, and
genetic predisposition as covariates.

Smoking affects lung cancer both directly and through the cumulative dose pathway
(pack-years). Age is a common cause of both smoking initiation and lung cancer risk
and must be adjusted for. Asbestos exposure and genetic risk are independent of
smoking and act as additional direct causes of lung cancer.

## Assumptions

- Smoking affects lung cancer both directly and via cumulative dose (pack-years as mediator)
- Age is a common cause of smoking and lung cancer — must be adjusted for
- Sex influences smoking behavior and lung cancer risk independently
- Asbestos and genetic risk are independent of smoking (no common causes)
- No unmeasured confounding between pack-years and lung cancer is assumed

## DAG

```dagitty
dag {
  smoking [exposure]
  lung_cancer [outcome]
  pack_years [mediator]
  age [covariate]
  sex [covariate]
  asbestos [covariate]
  genetic_risk [covariate]

  smoking -> lung_cancer
  smoking -> pack_years
  pack_years -> lung_cancer
  age -> lung_cancer
  age -> smoking
  sex -> smoking
  sex -> lung_cancer
  asbestos -> lung_cancer
  genetic_risk -> lung_cancer
}
```
