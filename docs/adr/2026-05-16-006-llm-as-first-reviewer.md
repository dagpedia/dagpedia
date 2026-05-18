---
date: '2026-05-16'
sequence: 6
title: LLM as First Reviewer, Not Final Judge
status: accepted
status_note: implementation deferred to v0.2.0
tags:
- review
- llm
- ci
related:
- 2026-05-16-005-defer-tier-system
---

# LLM as First Reviewer, Not Final Judge


## Context and Problem Statement

DAGpedia aims to maintain scientific quality of contributed DAGs at scale.
Manual expert review of every submission is the gold standard but does not
scale with community growth. LLMs (large language models) have broad domain
knowledge and can reason about causal structures, making them a candidate
for automated quality checks.

The design question is: what role should LLMs play in the DAG validation
pipeline?

## Considered Options

- LLM as final gatekeeper — DAGs are accepted or rejected automatically
  based on LLM judgment
- LLM as first reviewer — LLM produces a structured report of potential
  issues; a human makes the final decision
- No LLM involvement — all validation is human-driven

## Decision Outcome

Chosen option: **LLM as first reviewer, not final judge**

LLMs are well-suited to flagging common structural and semantic issues in DAGs
before human review. However, LLMs can hallucinate citations, misread
context-specific causal reasoning, and lack access to unpublished or
non-English literature. Granting them final authority would introduce
systematic errors that undermine DAGpedia's scientific credibility.

The role of the LLM is to reduce the cognitive load on human reviewers by
surfacing obvious problems — not to replace expert judgment.

### Validation checks the LLM performs

| Category | Example check |
|---|---|
| Temporal ordering | Does the outcome precede the exposure? |
| Missing common causes | Are obvious confounders absent? |
| Edge direction plausibility | Is the causal direction biologically/socially implausible? |
| Collider risk | Is a collider included in the adjustment set? |
| Over-adjustment | Does the adjustment set include a mediator on the causal path? |
| Unmeasured confounding | Should unmeasured confounders (U nodes) be present? |

### Output format

The LLM produces a structured YAML report with categorized issues, severity
levels (`high` / `medium` / `low`), and a confidence score. Human reviewers
can confirm or dismiss each flagged issue; dismissals are logged with a reason,
creating an audit trail consistent with the living DAGs epistemic framework.

Dismissed issues are retained in the record — the act of explicitly overriding
a flag is itself scientifically meaningful information.

### Grounding strategy

To reduce hallucination risk on evidence grading, LLM calls that assess
evidence strength are grounded via PubMed API lookup before the LLM is asked
to judge. The LLM reasons over retrieved abstracts, not training-data memory.

### Consequences

- Good: Scales review capacity without sacrificing human oversight
- Good: Consistent first-pass checks regardless of reviewer expertise
- Good: Dismissed flags create a transparent record of scientific reasoning
- Bad: LLM API calls introduce latency and cost per submission
- Bad: Requires careful prompt engineering to avoid over-flagging (reviewer
  fatigue) or under-flagging (false confidence)

## References

- Related: [2026-05-16 defer tier system](2026-05-16-005-defer-tier-system.md) (Tier system — LLM validation feeds into Reviewed tier)
- Reynolds RJ. Am J Epidemiol. 2026;195(5):1365–1367.
  https://doi.org/10.1093/aje/kwag029
