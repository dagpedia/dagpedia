# Project documentation

Design decisions, conventions, and contribution workflow for DAGpedia.
This folder is for **repository governance** — not published DAG content
(see `src/content/dags/` and `src/content/nodes/`).

## Where to find things

| Document | What it is |
|----------|------------|
| **[MAP.md](MAP.md)** | Everything: repo layout, ADR index, conventions, workflow (**auto-generated — do not edit**) |
| [adr/](adr/) | Architecture Decision Records (source files) |
| [conventions/](conventions/) | Naming, schema, and annotation rules |
| [workflow/](workflow/) | How to contribute, validate, and review |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Step-by-step guide for new DAGs |

`MAP.md` is rewritten when you run `python scripts/docs/validate_adr.py` (or `npm run validate`). Commit the updated `MAP.md` with your ADR changes.

## Adding a new ADR

1. `cp _templates/adr-template.md docs/adr/YYYY-MM-DD-NNN-short-title.md`
2. Set `date`, `sequence`, and `title` in frontmatter — see [adr/schema.json](adr/schema.json)
3. `python scripts/docs/validate_adr.py docs/adr/YYYY-MM-DD-NNN-short-title.md` (updates `MAP.md`)
4. Commit the ADR **and** `docs/MAP.md`
5. Open a PR
