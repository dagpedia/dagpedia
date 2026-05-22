# LLM text format

`_data/<id>.json` field `llm.text` is generated at build/CI time using this template.

## Template

```
DAG: {title}. Exposure: {exposure}. Outcome: {outcome}. Context: {population}, {geographic}, {era}. Edges: {edge_list}. Adjustment set (total effect): {adjustment_total}. Mediator: {mediators}.
```

## Placeholders

| Placeholder | Source |
|-------------|--------|
| `title` | frontmatter `title` |
| `exposure` | dagitty `[exposure]` node id |
| `outcome` | dagitty `[outcome]` node id |
| `population` | `context.population` |
| `geographic` | `context.geographic` |
| `era` | `context.era` |
| `edge_list` | sorted `from->to [evidence]` comma-separated |
| `adjustment_total` | first total-effect adjustment set, comma-separated node ids |
| `mediators` | node ids with `role: mediator` |

## `llm.edge_set_sorted`

Lexicographically sorted edge keys: `from->to` (no spaces).
