# From issue to DAG

## 1. Open or find an issue

Use [New DAG](https://github.com/dagpedia/dagpedia/issues/new?template=new-dag.yml) or
[New node](https://github.com/dagpedia/dagpedia/issues/new?template=new-node.yml) when
vocabulary is missing.

## 2. Nodes before edges

Add new variables as `src/content/nodes/<key>.md` in a **separate PR** before
referencing them in a DAG file.

## 3. Implement the DAG

Follow [CONTRIBUTING.md](../CONTRIBUTING.md). Link the PR to the issue
(`Fixes #NNN`).

## 4. Review and merge

CI must pass. After merge, the DAG appears at `/dags/<slug>` on the next deploy.
