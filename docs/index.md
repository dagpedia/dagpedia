---
hide:
  - navigation
---

# dagpedia

**A living repository of causal DAGs for epidemiology.**

dagpedia is a community-maintained library of directed acyclic graphs (DAGs) for causal inference in epidemiology. Each DAG is annotated with evidence levels, versioned, and open to contribution via GitHub pull requests.

The project implements the *living DAGs* framework proposed by [Reynolds (2026)](https://doi.org/10.1093/aje/kwag029): DAGs treated not as disposable study tools, but as shared epistemic infrastructure that supports cumulative science.

---

## Browse DAGs

<div class="grid cards" markdown>

- :material-graph: **[Epidemiology](dags/epidemiology/index.md)**

    Social determinants, cardiovascular, chronic disease, and more.

</div>

---

## How it works

Each DAG in dagpedia is a structured Markdown file with:

- **Interactive visualization** powered by [dagitty.js](https://dagitty.net)
- **Evidence levels** for every edge (*speculative → strong*)
- **Identification strategy** (backdoor, front-door, IV)
- **Related DAGs** linking to connected causal structures
- **Publications** linking to supporting literature
- **Version history** via git

Anyone can contribute. See [Contributing](contributing.md) to get started.

---

## Conceptual foundation

> "A new study begins not with a blank canvas, but with an existing structure to extend, test, or challenge. This is how we build a science that remembers."
>
> — Reynolds RJ. *Living DAGs: the future of DAGs in epidemiology.* Am J Epidemiol. 2026.
