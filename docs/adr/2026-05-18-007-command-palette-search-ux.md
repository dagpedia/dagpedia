---
date: '2026-05-18'
sequence: 7
title: Command palette (⌘K) as the primary search UX
status: accepted
tags:
  - search
  - ui
related:
  - 2026-05-18-006-build-time-search-index
  - 2026-05-18-002-ui-stack
---

# Command palette (⌘K) as the primary search UX

## Context and Problem Statement

The topbar needs a search entry point.

## Considered Options

| Pattern | Description |
|---------|-------------|
| Always-expanded input | Persistent search box in the nav |
| Icon-only | Single icon that expands on click |
| Command palette (⌘K) | Modal dialog triggered by button or keyboard shortcut |

## Decision Outcome

Chosen option: **Command palette (`⌘K` / `Ctrl+K`)** via shadcn/ui's `CommandDialog`.

- The topbar shows a compact trigger button (`Search DAGs and nodes... ⌘K`)
- Clicking the button or pressing `⌘K` opens a full `CommandDialog`
- Results are grouped by type (DAGs / Nodes) with icons and subtitles
- Selecting an item navigates to the corresponding page and closes the dialog
- `Escape` closes the dialog

DAGpedia's primary audience (researchers, epidemiologists, developers) is comfortable with
keyboard-driven UIs. The compact trigger preserves topbar space. `CommandDialog` ships with
accessible keyboard navigation, fuzzy filtering, and grouping out of the box.

### Consequences

- Good: Keyboard-first UX suits the target audience
- Good: Reuses shadcn/ui `Command` — no additional dependencies
- Good: Easily extended with command actions (e.g., "Fork this DAG", "Go to changelog")
- Bad: Less immediately discoverable than a persistent search box for new users
- Good: Mitigation — trigger button is always visible and labeled; tooltip shows `⌘K`

## References

- [cmdk](https://cmdk.paco.me/)
- shadcn/ui [Command](https://ui.shadcn.com/docs/components/command) component
