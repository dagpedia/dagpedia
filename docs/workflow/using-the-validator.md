# Using the validator

Content is checked by purpose-specific scripts under `scripts/`. All run in CI.

| Content | Script |
|---------|--------|
| Nodes | `scripts/nodes/validate_nodes.py` |
| DAGs | `scripts/dag/validate_dag.py` |
| ADRs | `scripts/docs/validate_adr.py` |

## Nodes

```bash
python scripts/nodes/validate_nodes.py src/content/nodes/your-node.md
# or
python scripts/nodes/validate_nodes.py --all
```

## DAGs

```bash
python scripts/dag/validate_dag.py src/content/dags/your-dag-id.md
# or
python scripts/dag/validate_dag.py --all
```

Run nodes before DAGs when adding vocabulary (DAG validation checks node keys exist).

## ADRs

```bash
python scripts/docs/validate_adr.py --all   # also refreshes docs/MAP.md
```

Frontmatter schema: [docs/adr/schema.json](../adr/schema.json)

## Skip MeSH API checks (offline / PR)

```bash
SKIP_MESH_VALIDATION=1 python scripts/nodes/validate_nodes.py --all
```

## All at once

```bash
npm run validate
```

## What CI checks

See `.github/workflows/ci.yml` (nodes → DAGs → ADRs → Next.js build → Vercel deploy on `main`).
