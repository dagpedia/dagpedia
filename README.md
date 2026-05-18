# DAGpedia

**A living repository of causal DAGs for epidemiology.**

DAGpedia is currently developed as a personal project, but its design is grounded in a published methodological direction rather than ad hoc ideas.
It implements the *living DAGs* vision proposed by [Reynolds (2026, AJE)](https://doi.org/10.1093/aje/kwag029): directed acyclic graphs treated not as disposable study tools, but as shared epistemic infrastructure — annotated with evidence levels, versioned over time, and open to community contribution.

---

## What is a living DAG?

A living DAG is:

- **Annotated** — each edge carries an evidence level (*speculative / weak / moderate / strong*)
- **Versioned** — git history traces how causal understanding evolves
- **Modular** — domain-level structures from which study-specific DAGs are derived
- **Open** — contributed and refined via GitHub pull requests

## Contributing

Anyone can contribute a DAG. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

Quick start:

```bash
# 1. Fork this repo and clone it
git clone https://github.com/YOUR_USERNAME/dagpedia.git

# 2. Copy the template
cp _templates/dag-template.md docs/dags/epidemiology/your-dag-name.md

# 3. Fill in the YAML frontmatter and dagitty code

# 4. Submit a pull request
```

## Repository structure

```
dagpedia/
├── docs/
│   ├── dags/
│   │   └── epidemiology/   ← DAG files (.md)
│   ├── javascripts/        ← dagitty.js + render script
│   └── stylesheets/        ← custom CSS
├── _templates/             ← contribution template
├── scripts/                ← validation scripts
├── .github/
│   ├── workflows/          ← CI (validate on PR)
│   └── ISSUE_TEMPLATE/     ← issue templates
└── mkdocs.yml
```

## Citation

If you use DAGpedia in your research, please cite:

> DAGpedia contributors. *DAGpedia: A living repository of causal DAGs for epidemiology*. https://dagpedia.org

And the conceptual foundation:

> Reynolds RJ. Living DAGs: the future of DAGs in epidemiology. Am J Epidemiol. 2026;195(5):1365–1367. https://doi.org/10.1093/aje/kwag029

## Roadmap

- **v0.1**: baseline DAG repository and contribution workflow (template, DAG validation, MkDocs publication).
- **v0.2**: richer evidence annotations, cross-DAG linkage, and expanded epidemiology coverage.

## License

DAG content: [CC BY 4.0](LICENSE-CONTENT)
Code: [MIT](LICENSE)
