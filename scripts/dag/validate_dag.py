#!/usr/bin/env python3
"""
Validate DAG markdown under src/content/dags/.
Usage:
  python scripts/dag/validate_dag.py [path/to/dag.md]
  python scripts/dag/validate_dag.py --all
"""

from __future__ import annotations

import glob
import sys
from pathlib import Path

import yaml

_SCRIPTS_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_SCRIPTS_DIR / "nodes"))
from validate_nodes import get_all_node_keys  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DAGS_DIR = REPO_ROOT / "src/content/dags"

REQUIRED_FIELDS = [
    "id", "title", "exposure", "outcome",
    "nodes", "evidence_level", "version",
]
VALID_EVIDENCE = {"strong", "moderate", "limited", "theoretical"}


def parse_frontmatter(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    if not content.startswith("---"):
        raise ValueError(f"{path}: frontmatter not found")
    parts = content.split("---", 2)
    return yaml.safe_load(parts[1])


def validate_dag(path: str, node_keys: set[str]) -> list[str]:
    errors: list[str] = []
    try:
        fm = parse_frontmatter(path)
    except Exception as e:
        return [f"Parse error: {e}"]

    for field in REQUIRED_FIELDS:
        if field not in fm:
            errors.append(f"Missing required field: '{field}'")

    if fm.get("evidence_level") not in VALID_EVIDENCE:
        errors.append(
            f"Invalid evidence_level: '{fm.get('evidence_level')}'. "
            f"Must be one of {VALID_EVIDENCE}"
        )

    slug = Path(path).stem
    if fm.get("id") != slug:
        errors.append(f"id '{fm.get('id')}' must match filename '{slug}'")

    dag_nodes = [n["key"] for n in fm.get("nodes", [])]
    for key in dag_nodes:
        if key not in node_keys:
            errors.append(
                f"Node key '{key}' not found in src/content/nodes/. "
                f"Add it first via a separate PR."
            )

    for field in ["exposure", "outcome"]:
        val = fm.get(field)
        if val and val not in dag_nodes:
            errors.append(f"'{field}' value '{val}' not listed in nodes")

    return errors


def collect_paths(args: list[str]) -> list[str]:
    if "--all" in args or not args:
        return glob.glob(str(DAGS_DIR / "*.md"))
    return [p for p in args if "dags/" in p or Path(p).parent.name == "dags"]


def main() -> None:
    paths = collect_paths(sys.argv[1:])
    if not paths:
        print("No DAG files found.")
        sys.exit(1)

    node_keys = get_all_node_keys()
    all_errors: list[str] = []

    for path in paths:
        errors = validate_dag(path, node_keys)
        if errors:
            all_errors.extend([f"[{path}] {e}" for e in errors])
        else:
            print(f"OK {path}")

    if all_errors:
        print("\nFAIL DAG validation failed:")
        for e in all_errors:
            print(f"  {e}")
        sys.exit(1)

    print(f"\nOK {len(paths)} DAG(s) validated")


if __name__ == "__main__":
    main()
