# DAGitty → React Flow adapter

DAG pages use [dagitty.js](https://dagitty.net) as the source of truth for graph structure and causal inference. [React Flow](https://reactflow.dev) renders the interactive canvas.

## Modules

| Module | Role |
|--------|------|
| [`src/lib/dagitty/runtime.ts`](../../src/lib/dagitty/runtime.ts) | Loads vendored `public/vendor/dagitty.js` (Node via jsdom, browser via `globalThis`) |
| [`src/lib/dagitty/adapter.ts`](../../src/lib/dagitty/adapter.ts) | `GraphParser.parseGuess` → nodes, edges, optional layout |
| [`src/lib/dagitty/analyze.ts`](../../src/lib/dagitty/analyze.ts) | Adjustment sets and conditional independencies |
| [`src/lib/dag-utils.ts`](../../src/lib/dag-utils.ts) | Builds `DagNode` / `DagEdge` for the app |

## Layout rules

1. **Explicit coordinates** — If every vertex in the dagitty source has `layout_pos_x` / `layout_pos_y` (from `pos="x,y"` in the DAGitty string), React Flow uses those positions directly.
2. **Fallback** — Otherwise [`layout-dag.ts`](../../src/components/dag-display/layout-dag.ts) runs **dagre** left-to-right auto-layout.

### Coordinate scale

Dagitty layout units are multiplied by `LAYOUT_SCALE` (120) in `adapter.ts` to map to React Flow pixel space. Tune this constant if a `pos=` fixture does not match [dagitty.net](https://dagitty.net) visually.

## Role precedence

1. Dagitty `[exposure]` / `[outcome]` tags (`isSource` / `isTarget`)
2. Other role tags (`mediator`, `covariate`, etc.)
3. Path-based inference in `inferNodeRoles()` when untagged

## Build-time causal metadata

`npm run generate-dag-meta` writes `public/dag-meta/[slug].json` with adjustment sets and conditional independencies computed from the dagitty block. Do not hand-write these in YAML frontmatter.

## Verification

```bash
npx tsx scripts/verify-dag-layout.ts
```
