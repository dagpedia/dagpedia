# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

DAGpedia is a content repository of causal Directed Acyclic Graphs (DAGs) for epidemiology. Each DAG is a Markdown file with YAML frontmatter encoding causal structure, plus a narrative body. The site is built with MkDocs Material and rendered to a static site at dagpedia.org. DAG widgets are interactive in the browser via a vendored dagitty.js library.

## Commands

```bash
# Install dependencies (Python 3.12)
pip install -r requirements.txt

# Validate a single DAG file
python scripts/validate_dag.py docs/dags/epidemiology/ses-cvd-classic.md

# Validate all DAG files
python scripts/validate_dag.py docs/dags/

# Build the site (also validates first)
bash scripts/build-site.sh

# Build the MkDocs site only
mkdocs build --strict

# Serve locally with live reload
mkdocs serve
```

## Architecture

### DAG files — the core content

Every DAG lives at `docs/dags/<field>/<dag-id>.md` where the filename stem (e.g. `ses-cvd-classic`) must exactly match the `id` field in the YAML frontmatter. The validator enforces this.

Each file has two parts:
1. **YAML frontmatter** (`---` delimited) — machine-readable causal metadata
2. **Markdown body** — human narrative (Background, Causal structure, Assumptions, Identification strategy, Known variants, Open questions)

The dagitty code appears in *both* places: once in the `dagitty:` frontmatter field (used by the validator) and once as a fenced ` ```dagitty ` block in the markdown body (rendered interactively in the browser).

### Validation (`scripts/validate_dag.py`)

CI runs this on every PR. It checks:
- All required frontmatter fields are present and non-empty
- `id` matches filename stem
- `status` ∈ `{draft, review, stable}`
- `identification` ∈ `{backdoor, frontdoor, iv, unidentified, unknown}`
- Each edge has `from`, `to`, `evidence`; `evidence` ∈ `{speculative, weak, moderate, strong}`
- `related_dags[*].relation` ∈ `{shared_exposure, shared_outcome, subgraph, supergraph, structural_variant, competing}`
- `related_dags[*].id` values exist in the repo (warning only, not error — allows forward references)
- `dagitty` field contains `dag {`

The validator accepts a single file or a directory. Missing `pyyaml` causes an immediate exit with instructions.

### Site rendering

MkDocs uses the `awesome-pages` plugin — navigation order is controlled by `.pages` files in each directory, not alphabetical sort. The `pymdownx.superfences` extension adds a custom `dagitty` fence type that renders as `<div class="dagitty-code">` (via `fence_div_format`). At runtime, `docs/javascripts/dagitty-render.js` picks up both `div.dagitty-code` elements and `pre code.language-dagitty` elements and instantiates interactive dagitty widgets using the vendored `docs/javascripts/dagitty.js`. The renderer polls for up to 8 seconds for `GraphParser` and `DAGittyController` globals before falling back to a link to dagitty.net.

### CI (`.github/workflows/validate.yml`)

Two jobs run on every PR to `main`:
1. `validate` — runs the Python validator against `docs/dags/`
2. `build-preview` (depends on `validate`) — runs `mkdocs build --strict` and spot-checks that the `ses-cvd-classic` page contains `<div class="dagitty-code">` and that `dagitty-render.js` selects `div.dagitty-code`

## Adding a new DAG

```bash
cp _templates/dag-template.md docs/dags/epidemiology/<exposure>-<outcome>-<context>.md
# Edit the file, then validate:
python scripts/validate_dag.py docs/dags/epidemiology/<your-file>.md
```

The filename slug becomes the `id`. Version follows semver: structural changes (add/remove nodes, reverse edges) bump minor; annotation fixes bump patch.

## Key constraints

- `id` must match the filename stem exactly — the validator hard-errors on mismatch
- The `dagitty:` frontmatter field and the ` ```dagitty ` fenced block in the body must stay in sync (they encode the same graph; one is for tooling, one for rendering)
- `dag-template.md` must never appear under `docs/dags/` — CI explicitly checks for this
- `related_dags` cross-references issue warnings (not errors) for IDs not yet in the repo, so forward references in a PR are safe
- DAG content is licensed CC BY 4.0; code is MIT — do not reproduce paywalled figures; encode causal knowledge as an original dagitty representation
