# DAG schema (`docs/schema`)

Machine-readable validation for DAG markdown and generated JSON.

## Vocabulary file format (unified)

All files under [enums/](enums/) share the same shape ([vocabulary-file.schema.json](vocabulary-file.schema.json)):

```yaml
vocabularies:
  <vocabularyKey>:
    open: true   # or false — closed enum (evidence only)
    entries:
      - id: slug-stored-in-frontmatter
        label: Display label
        description: Optional; required for evidenceLevels (UI legend)
```

| File | Keys in `vocabularies` | `open` |
|------|------------------------|--------|
| [enums/context.yaml](enums/context.yaml) | `populations`, `geographics`, `eras` | `true` |
| [enums/keywords.yaml](enums/keywords.yaml) | `keywords` | `true` |
| [enums/evidence-levels.yaml](enums/evidence-levels.yaml) | `evidenceLevels` | `false` |

`dag-validation.json` maps each manifest vocabulary key → YAML file + frontmatter field. A file may define multiple keys (`context.yaml`) or one (`keywords.yaml`).

Frontmatter stores **ids** only. UI and list views use **labels** (`vocabularyLabel()` / `labelSlug()`).

## Other schema files

| File | Role |
|------|------|
| [dag-validation.json](dag-validation.json) | Required fields, slug pattern, dagitty rules, vocabulary registry |
| [dag-data.schema.json](dag-data.schema.json) | `_data/<id>.json` output |
| [llm-text-format.md](llm-text-format.md) | `llm.text` template (human doc) |

## Consumers

- `scripts/lib/schema_loader.py` → `validate_dag.py`
- `src/lib/schema-loader.ts` → `dag-data-schema.ts`, UI labels

```bash
npm run validate
```
