# Resources

Curated references on causal DAGs, the living DAGs framework, DAGitty, and
LLM-assisted review — independent of DAGpedia site mechanics. For how this
project is built and run, see [About DAGpedia](about/index.md).

## Living DAGs

- Reynolds RJ. *Living DAGs: the future of DAGs in epidemiology.* Am J Epidemiol. 2026;195(5):1365–1367. [https://doi.org/10.1093/aje/kwag029](https://doi.org/10.1093/aje/kwag029)

## Causal DAGs

- Greenland S, Pearl J, Robins JM. Causal diagrams for epidemiologic research. *Epidemiology*. 1999;10(1):37–48. [https://doi.org/10.1097/00001648-199901000-00008](https://doi.org/10.1097/00001648-199901000-00008)
- VanderWeele TJ, Hernán MA. Causal diagrams and measurement bias. *Am J Epidemiol*. 2012;175(7):645–652. [https://doi.org/10.1093/aje/kwr431](https://doi.org/10.1093/aje/kwr431)
- Hernán MA, Robins JM. *Causal Inference: What If.* Boca Raton: Chapman & Hall/CRC; 2020. [https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/)

## DAGitty

- [dagitty.net](https://dagitty.net) — browser editor and reference implementation
- Textor J, van der Zander B, Gilthorpe MS, Liskiewicz M, Ellison GT. Robust causal inference using directed acyclic graphs: the R package *dagitty*. *Int J Epidemiol*. 2016;45(6):1887–1894. [https://doi.org/10.1093/ije/dyw341](https://doi.org/10.1093/ije/dyw341)
- [`dagitty`](https://cran.r-project.org/package=dagitty) and [`ggdag`](https://cran.r-project.org/package=ggdag) R packages

## LLM-assisted review

Large language models can flag structural issues in DAGs before human review,
but should not be treated as final arbiters of scientific judgment. Planned
DAGpedia validation checks (temporal ordering, collider risk, over-adjustment,
and related items) are described in [ADR-006](about/adr/006-llm-as-first-reviewer.md).

### Literature grounding

- [NCBI E-utilities (PubMed)](https://www.ncbi.nlm.nih.gov/home/develop/api/) — programmatic access to abstracts for evidence grounding

### Further reading

- National Academies of Sciences, Engineering, and Medicine. *Fostering Integrity in Research*. Washington, DC: National Academies Press; 2017. [https://doi.org/10.17226/21896](https://doi.org/10.17226/21896) — standards for transparency and reproducibility in research practice
