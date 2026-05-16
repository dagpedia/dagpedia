# About DAGpedia

DAGpedia is an open, community-maintained library of causal DAGs for epidemiology.
It implements the [living DAGs framework](../resources.md#living-dags) proposed by
Reynolds (2026): DAGs as shared epistemic infrastructure — annotated, versioned,
and open to community contribution.

## Website & repository

- [Website](https://dagpedia.org)
- [GitHub repository](https://github.com/dagpedia/dagpedia)
- [Contributing guide](../contributing.md)
- [DAG template](https://github.com/dagpedia/dagpedia/blob/main/_templates/dag-template.md) (`_templates/dag-template.md`)
- [Propose a new DAG](https://github.com/dagpedia/dagpedia/issues/new?template=new-dag.yml)

## Site & documentation

The public site is built with [MkDocs](https://www.mkdocs.org/) and the
[Material theme](https://squidfunk.github.io/mkdocs-material/), with navigation
managed via the [awesome-pages](https://github.com/lukasgeiter/mkdocs-awesome-pages-plugin)
plugin. See [ADR-007](adr/007-mkdocs-awesome-pages.md) for rationale.

DAG pages render interactively in the browser using
[dagitty.js](https://dagitty.net), developed by Johannes Textor and colleagues.
Custom scripts live under `docs/javascripts/`.

## License

- DAG content: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Code: [MIT](https://opensource.org/licenses/MIT)

## Contact

[Open an issue](https://github.com/dagpedia/dagpedia/issues) on GitHub.
