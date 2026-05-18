# DAGpedia

**A living repository of causal DAGs for epidemiology.**

DAGpedia is currently developed as a personal project, but its design is grounded in a published methodological direction rather than ad hoc ideas.
It implements the *living DAGs* vision proposed by [Reynolds (2026, AJE)](https://doi.org/10.1093/aje/kwag029): directed acyclic graphs treated not as disposable study tools, but as shared epistemic infrastructure — annotated with evidence levels, versioned over time, and open to community contribution.

**Site:** https://dagpedia.org

---

## Stack

| Layer | Technology |
|-------|------------|
| App | **Next.js 15** (App Router), **React 19**, **TypeScript** |
| Styling | **Tailwind CSS** |
| Hosting | **Vercel** (production deploys from `main` via GitHub Actions) |
| Content | Markdown + YAML frontmatter in `src/content/` |
| DAG rendering | [dagitty.js](https://dagitty.net) (vendored in `public/vendor/`) |
| Validation | Python scripts under `scripts/` (nodes, DAGs, ADRs) |
| DNS/CDN | Cloudflare → Vercel |

The public site is the Next.js app. The `docs/` folder holds **project governance** (ADRs, conventions, workflow) — not published site pages. MkDocs was used in an earlier iteration ([ADR 007](docs/adr/2026-05-16-007-mkdocs-awesome-pages.md), superseded).

---

## Development

**Requirements:** Node.js ≥ 20, Python 3.12, `pip install pyyaml aiohttp`

```bash
npm ci
npm run dev          # http://localhost:3000
npm run lint         # ESLint (Next.js)
npm run validate     # nodes → DAGs → ADRs (updates docs/MAP.md)
npm run build        # production build
npm run start        # serve production build locally
```

Optional: `SKIP_MESH_VALIDATION=1` to skip live MeSH API checks locally (CI skips them on pull requests).

---

## Deployment

- **Production:** pushes to `main` run [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — validate content, `npm run build`, then deploy to Vercel with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets.
- **Pull requests:** same validation and build; no deploy.
- **Redirects:** legacy MkDocs URLs are handled in [`vercel.json`](vercel.json) (e.g. `/dags/epidemiology/...` → `/dags/...`).

Preview deployments can also be enabled via the Vercel Git integration if configured on the project.

---

## Repository structure

```
dagpedia/
├── _templates/           # dag-template.md, adr-template.md
├── docs/                 # ADRs, conventions, workflow (governance, not site content)
│   ├── adr/
│   ├── conventions/
│   ├── workflow/
│   └── MAP.md            # auto-generated index (do not edit by hand)
├── src/
│   ├── app/              # Next.js routes (/ , /dags , /dags/[slug])
│   ├── components/       # DagViewer, MarkdownBody, UI
│   ├── content/
│   │   ├── dags/         # DAG markdown files
│   │   └── nodes/        # MeSH-backed node vocabulary
│   └── lib/              # Content loaders, types
├── public/vendor/        # dagitty.js
├── scripts/
│   ├── dag/              # validate_dag.py
│   ├── nodes/            # validate_nodes.py
│   ├── docs/             # validate_adr.py, generate_docs_index.py
│   └── deploy/           # reserved for deploy checks
└── .github/workflows/ci.yml
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Propose a new DAG via [GitHub Issues](https://github.com/dagpedia/dagpedia/issues) (templates: **New DAG**, **New Node**).

---

## Citation

> DAGpedia contributors. *DAGpedia: A living repository of causal DAGs for epidemiology*. https://dagpedia.org

> Reynolds RJ. Living DAGs: the future of DAGs in epidemiology. *Am J Epidemiol.* 2026;195:1365–1367. https://doi.org/10.1093/aje/kwag029

## License

DAG content: [CC BY 4.0](LICENSE-CONTENT) · Code: [MIT](LICENSE)
