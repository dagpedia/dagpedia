# ADR-004: Per-DAG DOI Over Repository-Level DOI

## Status

Accepted (implementation deferred to v0.2.0 — see ADR-005 rationale)

## Context and Problem Statement

A key motivation for Dagpedia is to provide academic credit for DAG
contributions, creating an incentive for researchers to contribute and
share their work. DOIs (Digital Object Identifiers) issued via Zenodo
enable contributors to cite their work in publications and CVs.

Two granularities of DOI issuance are possible: repository-level (one DOI
per release) and per-DAG (one DOI per individual DAG file or version).

## Considered Options

- Repository-level DOI — Zenodo automatically issues a DOI for each GitHub
  release; all contributors share the same citation
- Per-DAG DOI — A GitHub Action calls the Zenodo API on each DAG merge to
  issue an individual DOI; each contributor gets an independently citable
  artifact

## Decision Outcome

Chosen option: **Per-DAG DOI**, with repository-level DOI as a fallback
during v0.1.0.

A repository-level DOI supports the citation "We used Dagpedia (doi:...)" but
does not enable a contributor to write "My DAG (doi:...) was cited by X
studies." The per-DAG model is essential for the contributor incentive
structure that makes Dagpedia sustainable as a community resource.

The expected citation format for a per-DAG DOI:

```
Sakamaki M. Cannabis dispensary access and binge drinking DAG v1.0.
Dagpedia. 2026. doi: 10.5281/zenodo.XXXXXXX
```

### Consequences

- Good: Contributors receive independently citable artifacts — compatible
  with academic CV and publication practices
- Good: Fork versions can also receive their own DOIs, crediting the
  researcher who adapted the DAG
- Good: Enables tracking of how individual DAGs are reused across studies
- Bad: Requires GitHub Actions + Zenodo API integration (non-trivial
  implementation)
- Bad: Zenodo API calls introduce an external dependency in the CI/CD pipeline

### Implementation notes (v0.2.0)

1. GitHub Action triggers on merge of any file under `docs/dags/`
2. Zenodo API creates a new deposit, uploads the DAG file, sets metadata
   from frontmatter (title, authors, license, source DOI)
3. Zenodo publishes the deposit and returns a DOI
4. Action writes the DOI back to the DAG's frontmatter and commits

Both a concept DOI (always resolves to the latest version) and a version DOI
(resolves to the specific version) are stored in the frontmatter.

## References

- https://developers.zenodo.org/
- https://docs.github.com/en/actions
