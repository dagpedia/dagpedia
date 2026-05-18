# DAGpedia

**A living repository of causal DAGs for epidemiology.**

DAGpedia is currently developed as a personal project, but its design is grounded in a published methodological direction rather than ad hoc ideas.
It implements the *living DAGs* vision proposed by [Reynolds (2026, AJE)](https://doi.org/10.1093/aje/kwag029): directed acyclic graphs treated not as disposable study tools, but as shared epistemic infrastructure — annotated with evidence levels, versioned over time, and open to community contribution.

**Site:** https://dagpedia.org

---

## Stack (MVP)

- **Next.js 15** (App Router) on **Vercel**
- **Content:** Markdown + YAML frontmatter in `src/content/`
- **DAG rendering:** [dagitty.js](https://dagitty.net) (vendored)
- **Validation:** `scripts/validate_dag.py` in CI
- **DNS/CDN:** Cloudflare → Vercel

---

## Development

```bash
npm ci
npm run dev          # http://localhost:3000
npm run validate     # python scripts/validate_dag.py --all
npm run build
```

Python 3.12 + `pip install pyyaml aiohttp` for local validation.

Optional: `SKIP_MESH_VALIDATION=1` to skip live MeSH API checks locally.

---

## Repository structure

```
dagpedia/
├── src/
│   ├── app/              # Next.js routes (/ , /dags , /dags/[slug])
│   ├── components/       # DagViewer, MarkdownBody
│   ├── content/
│   │   ├── dags/         # DAG markdown files
│   │   └── nodes/        # MeSH-backed node vocabulary
│   └── lib/              # Content loaders
├── public/vendor/        # dagitty.js
├── scripts/validate_dag.py
└── .github/workflows/ci.yml
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Propose a new DAG via GitHub Issues.

---

## Citation

> DAGpedia contributors. *DAGpedia: A living repository of causal DAGs for epidemiology*. https://dagpedia.org

> Reynolds RJ. Living DAGs: the future of DAGs in epidemiology. *Am J Epidemiol.* 2026;195:1365–1367. https://doi.org/10.1093/aje/kwag029

## License

DAG content: [CC BY 4.0](LICENSE-CONTENT) · Code: [MIT](LICENSE)
