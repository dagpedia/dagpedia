# Scripts

Utility scripts grouped by purpose. Run from the **repository root**.

| Folder | Scripts | Purpose |
|--------|---------|---------|
| [dag/](dag/) | `validate_dag.py` | `src/content/dags/` frontmatter and node references |
| [nodes/](nodes/) | `validate_nodes.py` | `src/content/nodes/` MeSH / dagpedia_id checks |
| [docs/](docs/) | `validate_adr.py`, `generate_docs_index.py` | ADRs and `docs/MAP.md` |
| [deploy/](deploy/) | _(reserved)_ | Deployment checks (see README there) |

```bash
npm run validate
```

Or individually:

```bash
python scripts/nodes/validate_nodes.py --all
python scripts/dag/validate_dag.py --all
python scripts/docs/validate_adr.py --all
```
