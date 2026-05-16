# Contributing to DAGpedia

Thank you for contributing. DAGpedia grows through community contribution — every DAG added strengthens the shared epistemic infrastructure for causal inference in epidemiology.

## Who can contribute?

Anyone. You don't need to be an expert in every aspect of a causal system — partial DAGs with clearly labeled uncertainty are valuable. The evidence level annotation system is designed precisely for this.

## How to contribute a new DAG

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/dagpedia.git
cd dagpedia
```

### 2. Copy the template

```bash
cp _templates/dag-template.md docs/dags/epidemiology/your-dag-id.md
```

Use a short, descriptive slug as the filename: `exposure-outcome-context.md`
Examples: `ses-cvd-classic.md`, `cannabis-binge-drinking-usa.md`

### 3. Fill in the frontmatter

Every field marked **required** must be completed before submitting.
Optional fields are encouraged but not blocking.

Key decisions:

**`status`**
- `draft` — initial submission, not yet reviewed
- `review` — under active review
- `stable` — reviewed and endorsed by ≥1 maintainer

**`evidence` levels per edge**
- `speculative` — theoretical basis only, no empirical support
- `weak` — limited or conflicting evidence
- `moderate` — consistent evidence from observational studies
- `strong` — experimental or high-quality replication evidence

**`identification`**
- `backdoor` — identifiable via backdoor criterion
- `frontdoor` — identifiable via front-door criterion
- `iv` — requires instrumental variable
- `unidentified` — not identified given current structure
- `unknown` — requires further analysis

### 4. Write the narrative

The body of the markdown file (below the frontmatter) should include:

- **Background** — why this causal question matters
- **Assumptions** — what the DAG encodes and what it leaves out
- **Identification strategy** — how to estimate the effect
- **Known variants** — alternative DAG structures and when they apply
- **Open questions** — what remains speculative

### 5. Validate locally (optional but recommended)

```bash
pip install pyyaml
python scripts/validate_dag.py docs/dags/epidemiology/your-dag-id.md
```

### 6. Submit a pull request

Push your branch and open a PR against `main`. The PR template will guide you through the checklist.

CI will automatically:
- Check all required YAML fields are present
- Validate that `related_dags` IDs exist in the repository
- Build the site to ensure no rendering errors

## How to update an existing DAG

1. Edit the `.md` file directly
2. Increment the `version` field (e.g. `0.1.0` → `0.2.0`)
3. Add your GitHub username to `contributors`
4. Submit a PR with a clear description of what changed and why

Version history is preserved in git. Major structural changes (adding/removing nodes, reversing edges) should bump the minor version. Evidence level updates or annotation fixes are patch versions.

## Reviewing pull requests

Maintainers review PRs for:
- Dagitty syntax validity
- Completeness of required fields
- Plausibility of evidence level assignments
- Clarity of the narrative

We do not require the DAG to be "correct" — causal assumptions are inherently contestable. We do require that assumptions are made explicit.

## Copyright and paywalled sources

When a DAG is informed by a paywalled paper, contributors must encode the causal
structure as a new dagitty representation. Do not reproduce or trace the
paper's original figure; submit an original encoding of the causal knowledge
(nodes, edges, and assumptions) in your own words and structure.

## Code of conduct

Be constructive. Scientific disagreement is welcome; personal criticism is not.
When a DAG encodes contested assumptions, note it in the `status` or open an issue.

## Questions?

Open a [GitHub issue](https://github.com/dagpedia/dagpedia/issues) or start a discussion.
