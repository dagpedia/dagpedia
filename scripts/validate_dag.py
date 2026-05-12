#!/usr/bin/env python3
"""
dagpedia — DAG file validator

Checks required YAML frontmatter fields, evidence level values,
related_dag ID cross-references, and basic dagitty syntax.

Usage:
    python scripts/validate_dag.py docs/dags/epidemiology/ses-cvd-classic.md
    python scripts/validate_dag.py docs/dags/             # validate all
"""

import sys
import os
import re
import glob
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml not installed. Run: pip install pyyaml")
    sys.exit(1)

REQUIRED_FIELDS = [
    "id", "title", "version", "status",
    "field", "exposure", "outcome",
    "dagitty", "edges", "adjustment_set", "identification",
]

VALID_STATUS = {"draft", "review", "stable"}
VALID_EVIDENCE = {"speculative", "weak", "moderate", "strong"}
VALID_IDENTIFICATION = {"backdoor", "frontdoor", "iv", "unidentified", "unknown"}
VALID_RELATION = {
    "shared_exposure", "shared_outcome",
    "subgraph", "supergraph",
    "structural_variant", "competing",
}


def parse_frontmatter(filepath: str) -> dict | None:
    """Extract and parse YAML frontmatter from a markdown file."""
    content = Path(filepath).read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return None
    return yaml.safe_load(match.group(1))


def collect_all_ids(dag_root: str) -> set[str]:
    """Collect all DAG IDs from the repository."""
    ids = set()
    for filepath in glob.glob(f"{dag_root}/**/*.md", recursive=True):
        if "_templates" in filepath:
            continue
        if Path(filepath).name in {"index.md", "dag-template.md"}:
            continue
        fm = parse_frontmatter(filepath)
        if fm and "id" in fm:
            ids.add(fm["id"])
    return ids


def validate_file(filepath: str, all_ids: set[str]) -> list[str]:
    """Validate a single DAG file. Returns list of error messages."""
    errors = []
    name = Path(filepath).name

    fm = parse_frontmatter(filepath)
    if fm is None:
        errors.append(f"[{name}] No YAML frontmatter found")
        return errors

    # Required fields
    for field in REQUIRED_FIELDS:
        if field not in fm or fm[field] is None or fm[field] == "":
            errors.append(f"[{name}] Missing required field: '{field}'")

    if errors:
        return errors  # Skip further checks if basics are missing

    # Status
    if fm["status"] not in VALID_STATUS:
        errors.append(f"[{name}] Invalid status '{fm['status']}'. Must be one of: {VALID_STATUS}")

    # Identification
    if fm["identification"] not in VALID_IDENTIFICATION:
        errors.append(f"[{name}] Invalid identification '{fm['identification']}'. Must be one of: {VALID_IDENTIFICATION}")

    # ID matches filename
    expected_id = Path(filepath).stem
    if fm["id"] != expected_id:
        errors.append(f"[{name}] id '{fm['id']}' does not match filename '{expected_id}'")

    # Edges
    if not isinstance(fm.get("edges"), list) or len(fm["edges"]) == 0:
        errors.append(f"[{name}] 'edges' must be a non-empty list")
    else:
        for i, edge in enumerate(fm["edges"]):
            if not isinstance(edge, dict):
                errors.append(f"[{name}] edges[{i}] must be a mapping")
                continue
            for req in ("from", "to", "evidence"):
                if req not in edge:
                    errors.append(f"[{name}] edges[{i}] missing '{req}'")
            if "evidence" in edge and edge["evidence"] not in VALID_EVIDENCE:
                errors.append(
                    f"[{name}] edges[{i}] invalid evidence '{edge['evidence']}'. "
                    f"Must be one of: {VALID_EVIDENCE}"
                )

    # Related DAGs cross-reference
    if fm.get("related_dags"):
        for rel in fm["related_dags"]:
            if not isinstance(rel, dict) or "id" not in rel:
                errors.append(f"[{name}] related_dags entry missing 'id'")
                continue
            if rel["id"] not in all_ids:
                print(
                    f"  ⚠ [{name}] Warning: related_dag id '{rel['id']}' "
                    "not in repository yet (continuing)"
                )
            if "relation" in rel and rel["relation"] not in VALID_RELATION:
                errors.append(
                    f"[{name}] related_dag relation '{rel['relation']}' invalid. "
                    f"Must be one of: {VALID_RELATION}"
                )

    # Dagitty code: basic check
    dag_code = str(fm.get("dagitty", ""))
    if "dag {" not in dag_code and "dag{" not in dag_code:
        errors.append(f"[{name}] 'dagitty' field does not appear to contain valid dagitty syntax (missing 'dag {{')")

    return errors


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: validate_dag.py <file.md|directory>")
        sys.exit(1)

    target = args[0]
    dag_root = "docs/dags"

    # Collect all IDs for cross-reference checking
    all_ids = collect_all_ids(dag_root)

    # Gather files to validate
    EXCLUDE = {"index.md", "dag-template.md"}
    if os.path.isdir(target):
        files = [
            f for f in glob.glob(f"{target}/**/*.md", recursive=True)
            if "_templates" not in f and Path(f).name not in EXCLUDE
        ]
    else:
        files = [target]

    if not files:
        print("No DAG files found.")
        sys.exit(0)

    all_errors = []
    for filepath in sorted(files):
        errors = validate_file(filepath, all_ids)
        all_errors.extend(errors)

    if all_errors:
        print(f"Validation failed — {len(all_errors)} error(s):\n")
        for err in all_errors:
            print(f"  ✗ {err}")
        sys.exit(1)
    else:
        print(f"✓ All {len(files)} file(s) valid.")
        sys.exit(0)


if __name__ == "__main__":
    main()
