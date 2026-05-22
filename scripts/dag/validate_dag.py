#!/usr/bin/env python3
"""
Validate DAG markdown under src/content/dags/ (Issue #52 frontmatter).
Usage:
  python scripts/dag/validate_dag.py [path/to/dag.md]
  python scripts/dag/validate_dag.py --all
"""

from __future__ import annotations

import glob
import re
import sys
from pathlib import Path

import yaml

_SCRIPTS_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_SCRIPTS_DIR))
sys.path.insert(0, str(_SCRIPTS_DIR / "nodes"))
from lib.schema_enums import (  # noqa: E402
    load_eras,
    load_evidence_levels,
    load_geographics,
    load_keywords,
    load_populations,
)
from validate_nodes import get_all_node_keys  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DAGS_DIR = REPO_ROOT / "src/content/dags"

REQUIRED_TOP = ["id", "title", "context", "dagitty", "evidence", "keywords"]
ID_PATTERN = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
FORBIDDEN_DAGITTY_ATTRS = re.compile(
    r"\[(mediator|covariate|instrument|collider)\]", re.IGNORECASE
)
EDGE_PATTERN = re.compile(r"(\w+)\s*->\s*(\w+)")
NODE_DECL_PATTERN = re.compile(r"^\s*(\w+)\s*(\[.*\])?\s*$", re.MULTILINE)


def parse_frontmatter(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    if not content.startswith("---"):
        raise ValueError(f"{path}: frontmatter not found")
    parts = content.split("---", 2)
    return yaml.safe_load(parts[1])


def parse_dagitty_edges_and_nodes(code: str) -> tuple[set[str], set[tuple[str, str]]]:
    nodes: set[str] = set()
    edges: set[tuple[str, str]] = set()
    in_block = False
    for line in code.splitlines():
        stripped = line.strip()
        if stripped.startswith("dag"):
            in_block = True
            continue
        if not in_block:
            continue
        if stripped == "}":
            break
        if "->" in stripped:
            m = EDGE_PATTERN.search(stripped)
            if m:
                edges.add((m.group(1), m.group(2)))
                nodes.add(m.group(1))
                nodes.add(m.group(2))
            continue
        m = NODE_DECL_PATTERN.match(stripped)
        if m and m.group(1) not in ("dag",):
            nodes.add(m.group(1))
    return nodes, edges


def evidence_key(fr: str, to: str) -> str:
    return f"{fr} -> {to}"


def list_dag_ids() -> set[str]:
    ids: set[str] = set()
    for path in DAGS_DIR.glob("*.md"):
        ids.add(path.stem)
    return ids


def validate_dag(path: str, node_keys: set[str], all_dag_ids: set[str]) -> list[str]:
    errors: list[str] = []
    try:
        fm = parse_frontmatter(path)
    except Exception as e:
        return [f"Parse error: {e}"]

    for field in REQUIRED_TOP:
        if field not in fm:
            errors.append(f"Missing required field: '{field}'")

    slug = Path(path).stem
    dag_id = fm.get("id")
    if dag_id != slug:
        errors.append(f"id '{dag_id}' must match filename '{slug}'")
    if dag_id and not ID_PATTERN.match(str(dag_id)):
        errors.append(f"Invalid id '{dag_id}' (pattern: lowercase slug)")

    title = fm.get("title", "")
    if not title or len(str(title)) > 80:
        errors.append("title must be present and max 80 characters")

    ctx = fm.get("context") or {}
    if not isinstance(ctx, dict):
        errors.append("context must be a mapping")
    else:
        pops = load_populations()
        geos = load_geographics()
        eras = load_eras()
        for key, allowed in [
            ("population", pops),
            ("geographic", geos),
            ("era", eras),
        ]:
            val = ctx.get(key)
            if not val:
                errors.append(f"context.{key} is required")
            elif val not in allowed:
                errors.append(
                    f"Invalid context.{key}: '{val}'. Must be one of {sorted(allowed)}"
                )
        note = ctx.get("note")
        if note is not None and len(str(note)) > 200:
            errors.append("context.note max 200 characters")

    keywords = fm.get("keywords") or []
    allowed_kw = load_keywords()
    if not keywords:
        errors.append("keywords must be a non-empty list")
    for kw in keywords:
        if kw not in allowed_kw:
            errors.append(f"Invalid keyword: '{kw}'")

    dagitty = fm.get("dagitty", "")
    if not isinstance(dagitty, str) or not dagitty.strip():
        errors.append("dagitty must be a non-empty string")
    else:
        if FORBIDDEN_DAGITTY_ATTRS.search(dagitty):
            errors.append(
                "dagitty contains non-native role attributes "
                "([mediator], [covariate], etc.). Use structure-only; roles are inferred."
            )
        if "[exposure]" not in dagitty or "[outcome]" not in dagitty:
            errors.append("dagitty must tag one node [exposure] and one [outcome]")

        dag_nodes, dag_edges = parse_dagitty_edges_and_nodes(dagitty)
        for nid in dag_nodes:
            if nid not in node_keys:
                errors.append(
                    f"Node '{nid}' not in src/content/nodes/. Add via a separate PR."
                )

        evidence = fm.get("evidence") or {}
        if not isinstance(evidence, dict):
            errors.append("evidence must be a mapping")
        else:
            valid_ev = load_evidence_levels()
            evidence_keys = set()
            for key, level in evidence.items():
                if level not in valid_ev:
                    errors.append(
                        f"Invalid evidence level for '{key}': '{level}'"
                    )
                evidence_keys.add(key.replace(" ", ""))

            def norm_edge_key(key: str) -> str:
                parts = re.split(r"\s*->\s*", key.strip())
                if len(parts) != 2:
                    return key.strip()
                return evidence_key(parts[0], parts[1])

            expected_keys = {evidence_key(a, b) for a, b in dag_edges}
            fm_edge_keys = {norm_edge_key(k) for k in evidence}
            if fm_edge_keys != expected_keys:
                missing = expected_keys - fm_edge_keys
                extra = fm_edge_keys - expected_keys
                if missing:
                    errors.append(f"evidence missing keys: {sorted(missing)}")
                if extra:
                    errors.append(f"evidence extra keys: {sorted(extra)}")

    alternatives = fm.get("alternatives") or []
    if not isinstance(alternatives, list):
        errors.append("alternatives must be a list")
    else:
        for alt_id in alternatives:
            if alt_id not in all_dag_ids:
                errors.append(
                    f"alternatives entry '{alt_id}' does not match an existing DAG id"
                )

    return errors


def collect_paths(args: list[str]) -> list[str]:
    if "--all" in args or not args:
        return glob.glob(str(DAGS_DIR / "*.md"))
    return [p for p in args if "dags/" in p or Path(p).parent.name == "dags"]


def main() -> int:
    paths = collect_paths(sys.argv[1:])
    if not paths:
        print("No DAG files found.", file=sys.stderr)
        return 1

    node_keys = get_all_node_keys()
    all_dag_ids = list_dag_ids()
    failed = False

    for path in sorted(paths):
        errors = validate_dag(path, node_keys, all_dag_ids)
        if errors:
            failed = True
            print(f"\n{path}:")
            for err in errors:
                print(f"  x {err}")
        else:
            print(f"ok {path}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
