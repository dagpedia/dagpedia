# Contributing to DAGpedia

Thank you for contributing. DAGpedia grows through community contribution — every DAG added strengthens the shared epistemic infrastructure for causal inference in epidemiology.

**Also see:** [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) (DAG frontmatter and narrative), [docs/MAP.md](docs/MAP.md) (repo map and ADR index), [docs/workflow/](docs/workflow/) (validation and review).

---

## Development setup

1. **Fork and clone** the repository.
2. **Node.js** ≥ 20 and **Python** 3.12.
3. Install dependencies:

```bash
npm ci
pip install pyyaml aiohttp
```

4. Run the dev server:

```bash
npm run dev    # http://localhost:3000
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (`next lint`) — run before opening a PR |
| `npm run validate` | All Python validators (nodes → DAGs → ADRs; refreshes `docs/MAP.md`) |

Individual validators (from repo root):

```bash
python scripts/nodes/validate_nodes.py --all
python scripts/dag/validate_dag.py --all
python scripts/dag/validate_dag.py src/content/dags/your-dag-id.md
python scripts/docs/validate_adr.py --all
```

Set `SKIP_MESH_VALIDATION=1` locally to skip live MeSH API checks (CI skips them on pull requests).

There is no separate `test` script today; CI relies on validation + `npm run build`.

---

## CI and deployment

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

**On every pull request and push to `main`:**

1. Validate all nodes (`scripts/nodes/validate_nodes.py --all`)
2. Validate all DAGs (`scripts/dag/validate_dag.py --all`)
3. Validate ADRs and ensure `docs/MAP.md` is up to date (`scripts/docs/validate_adr.py --all` + `git diff --exit-code docs/MAP.md`)
4. `npm ci` and `npm run build`

**On push to `main` only:** deploy to Vercel production (requires repository secrets).

Run `npm run validate` and `npm run lint` locally before pushing to avoid CI failures.

---

## Branch and pull request expectations

1. Branch from **`main`** (e.g. `add-dag-foo` or `fix-node-bar`).
2. Keep PRs focused — one DAG or one logical change per PR when possible.
3. Add new **nodes** in `src/content/nodes/` in a separate PR before referencing them from a DAG.
4. Open a PR against **`main`** with a clear title and description of what changed and why.
5. Use GitHub **issue templates** (**New DAG**, **New Node**) when starting work; there is no separate PR template file yet.
6. Respond to review feedback; when revising a DAG, bump `version` and add your GitHub username to `contributors`.

Maintainers review for dagitty syntax, required frontmatter, plausible evidence levels, and narrative clarity. DAGs need not be universally “correct” — assumptions must be **explicit**.

---

## Contributing a new DAG (summary)

1. Copy the template:

```bash
cp _templates/dag-template.md src/content/dags/your-dag-id.md
```

2. Fill required YAML frontmatter (`id`, `title`, `version`, `status`, `dagitty`, `edges`, etc.) — see the template and [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
3. Write the narrative (background, assumptions, identification, variants, open questions).
4. Validate:

```bash
npm run validate
# or: python scripts/dag/validate_dag.py src/content/dags/your-dag-id.md
```

5. Open a PR against `main`.

---

## Contributing ADRs or docs

ADRs live in `docs/adr/`. See [docs/README.md](docs/README.md):

```bash
cp _templates/adr-template.md docs/adr/YYYY-MM-DD-NNN-short-title.md
python scripts/docs/validate_adr.py docs/adr/YYYY-MM-DD-NNN-short-title.md
```

Commit the ADR **and** the updated `docs/MAP.md`.

---

## Copyright and paywalled sources

When a DAG is informed by a paywalled paper, encode the causal structure as a new dagitty representation. Do not reproduce or trace the paper’s original figure.

---

## Code of conduct

Be constructive. Scientific disagreement is welcome; personal criticism is not.

---

## Questions?

Open a [GitHub issue](https://github.com/dagpedia/dagpedia/issues) or start a discussion.
