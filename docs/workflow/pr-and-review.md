# Pull requests and review

## Contributor checklist

1. Branch from `main`
2. Copy `_templates/dag-template.md` into `src/content/dags/`
3. Run `python scripts/dag/validate_dag.py` on your file
4. Open a PR — the template checklist guides required fields
5. Respond to review comments; update `version` and `contributors` when revising

## Maintainer review criteria

Maintainers check for:

- Valid dagitty syntax
- Complete required frontmatter
- Plausible evidence level assignments
- Clear narrative (background, assumptions, identification)

DAGs need not be universally "correct" — causal assumptions are contestable.
They must be **explicit**.

See also [CONTRIBUTING.md](../CONTRIBUTING.md#reviewing-pull-requests).
