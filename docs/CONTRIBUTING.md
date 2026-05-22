# Contributing to DAGpedia

Thank you for contributing. DAGpedia grows through community contribution — every DAG added strengthens the shared epistemic infrastructure for causal inference in epidemiology.

**Project docs:** [MAP.md](MAP.md), schema enums in [schema/](schema/), ADRs in [adr/](adr/).

## Two-layer DAG content (Issue #52)

| Layer | Path | Who edits |
|-------|------|-----------|
| Contributor markdown | `src/content/dags/<id>.md` | You (via PR) |
| Generated JSON | `_data/<id>.json` | CI bot only |

Never hand-edit `_data/*.json`. Run `npm run generate-dag-data` locally to preview; CI commits updates on PRs.

## How to contribute a new DAG

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/dagpedia.git
cd dagpedia
npm ci
pip install pyyaml aiohttp
```

### 2. Copy the template

```bash
cp _templates/dag-template.md src/content/dags/your-dag-id.md
```

Add new node keys under `src/content/nodes/` in a **separate PR** before using them in `dagitty`.

### 3. Frontmatter (required)

- `id`, `title` (max 80 characters)
- `context`: `population`, `geographic`, `era` — values from [schema/](schema/)
- `dagitty`: pipe block with graph; tag `[exposure]` and `[outcome]` only (no `[mediator]` / `[covariate]`)
- `evidence`: every edge as `from -> to: level` (levels in [evidence-levels.md](schema/evidence-levels.md))
- `keywords`: from [keywords.md](schema/keywords.md)
- `alternatives`: list of other DAG ids (or `[]`)

Do **not** include `version`, `contributors`, `nodes`, `edges`, or `adjustment_sets` in frontmatter.

### 4. Narrative body (recommended sections)

- **Operationalization** — how nodes are measured
- **Edge rationale** — citations (DOI/PMID) for non-obvious edges
- **Missing edge rationale** — omitted edges
- **Context and reusability**
- **Known limitations**

### 5. Validate locally

```bash
python scripts/nodes/validate_nodes.py --all
python scripts/dag/validate_dag.py src/content/dags/your-dag-id.md
npm run generate-dag-data
npm run build
```

### 6. Pull request

Open a PR against `main`. The bot will commit `_data/your-dag-id.json` if needed.

## Updating an existing DAG

Edit `src/content/dags/<id>.md` only. Git history is the version record. Re-run validation and let CI refresh `_data/`.

## Review criteria

- Dagitty syntax and enum/schema compliance
- `evidence` keys match dagitty edges exactly
- Clear narrative and explicit assumptions

We do not require universal agreement on causal structure — assumptions must be **explicit**.
