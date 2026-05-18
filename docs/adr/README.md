# Architecture Decision Records

ADRs capture significant design choices and their rationale.

## Naming

`docs/adr/YYYY-MM-DD-NNN-short-slug.md`

- **date** — day the decision was recorded
- **NNN** — sequence within that day (`001`, `002`, …); must be unique per date
- **slug** — short topic identifier

Example: `2026-05-18-001-evidence-levels.md`, `2026-05-18-002-tag-taxonomy.md`

Pick the next free `sequence` for that date (check [MAP.md](../MAP.md) decision log).

## Format

Each ADR has **YAML frontmatter** (typed, CI-validated) and a fixed markdown body.

| Field | Required | Description |
|-------|----------|-------------|
| `date` | yes | `YYYY-MM-DD`; must match filename |
| `sequence` | yes | Integer matching filename `NNN` |
| `title` | yes | Document title (also the H1) |
| `status` | yes | `proposed` \| `accepted` \| `deprecated` \| `superseded` |
| `status_note` | no | e.g. deferred implementation |
| `tags` | no | Lowercase slugs for discovery |
| `related` | no | Related ADR file stems |
| `supersedes` | no | ADR file stems this one replaces |
| `superseded_by` | no | ADR file stem that replaces this one |

JSON Schema: [schema.json](schema.json)

## Body sections (required)

1. `# {title}` — must match frontmatter `title`
2. `## Context and Problem Statement`
3. `## Considered Options`
4. `## Decision Outcome` with `### Consequences`
5. `## References`

Do **not** add `## Status` in the body; use frontmatter `status` only.

## Commands

```bash
cp _templates/adr-template.md docs/adr/$(date +%Y-%m-%d)-001-your-topic.md
# edit frontmatter and body
python scripts/docs/validate_adr.py docs/adr/YYYY-MM-DD-NNN-your-topic.md
```

## Index

- [MAP.md](../MAP.md) — documentation map and decision log (auto-generated)
