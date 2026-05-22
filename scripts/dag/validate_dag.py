#!/usr/bin/env python3
"""
Validate DAG markdown under src/content/dags/.
Rules: docs/schema/dag-validation.json + docs/schema/enums/*.yaml
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
from lib.schema_loader import (  # noqa: E402
    get_context_note_max_length,
    get_forbidden_dagitty_pattern,
    get_id_pattern,
    get_node_library_path,
    get_required_dagitty_tags,
    get_required_frontmatter,
    get_title_max_length,
    load_manifest,
    validate_closed_vocabulary_value,
    validate_open_vocabulary_value,
)
from validate_nodes import get_all_node_keys  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DAGS_DIR = REPO_ROOT / "src/content/dags"

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


def validate_dag(
    path: str, node_keys: set[str], all_dag_ids: set[str]
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    manifest = load_manifest()
    id_pattern = get_id_pattern()
    title_max = get_title_max_length()
    note_max = get_context_note_max_length()
    forbidden_dagitty = get_forbidden_dagitty_pattern()
    required_dagitty_tags = get_required_dagitty_tags()
    node_library = get_node_library_path()

    try:
        fm = parse_frontmatter(path)
    except Exception as e:
        return [f"Parse error: {e}"], []

    for field in get_required_frontmatter():
        if field not in fm:
            errors.append(f"Missing required field: '{field}'")

    slug = Path(path).stem
    dag_id = fm.get("id")
    if manifest["fields"]["id"].get("mustMatchFilename") and dag_id != slug:
        errors.append(f"id '{dag_id}' must match filename '{slug}'")
    if dag_id and not id_pattern.match(str(dag_id)):
        errors.append(f"Invalid id '{dag_id}' (pattern: {id_pattern.pattern})")

    title = fm.get("title", "")
    title_min = manifest["fields"]["title"].get("minLength", 1)
    if not title or len(str(title)) < title_min or len(str(title)) > title_max:
        errors.append(
            f"title must be present and between {title_min} and {title_max} characters"
        )

    ctx = fm.get("context") or {}
    ctx_spec = manifest["fields"]["context"]
    if not isinstance(ctx, dict):
        errors.append("context must be a mapping")
    else:
        ctx_props = ctx_spec["properties"]
        for key in ctx_spec["required"]:
            prop = ctx_props[key]
            vocab_key = prop["vocabulary"]
            val = ctx.get(key)
            if not val:
                errors.append(f"context.{key} is required")
                continue
            field_name = f"context.{key}"
            if prop.get("open", True):
                errs, warns = validate_open_vocabulary_value(
                    vocab_key, str(val), field_name
                )
                errors.extend(errs)
                warnings.extend(warns)
            else:
                errors.extend(
                    validate_closed_vocabulary_value(vocab_key, str(val), field_name)
                )
        note = ctx.get("note")
        if note is not None and len(str(note)) > note_max:
            errors.append(f"context.note max {note_max} characters")

    keywords = fm.get("keywords") or []
    kw_spec = manifest["fields"]["keywords"]
    kw_min = kw_spec.get("minItems", 1)
    kw_vocab = kw_spec["vocabulary"]
    if not keywords or len(keywords) < kw_min:
        errors.append(f"keywords must be a list with at least {kw_min} item(s)")
    for kw in keywords:
        errs, warns = validate_open_vocabulary_value(
            kw_vocab, str(kw), "keywords[]"
        )
        errors.extend(errs)
        warnings.extend(warns)

    dagitty = fm.get("dagitty", "")
    dagitty_min = manifest["fields"]["dagitty"].get("minLength", 1)
    if not isinstance(dagitty, str) or len(dagitty.strip()) < dagitty_min:
        errors.append("dagitty must be a non-empty string")
    else:
        if forbidden_dagitty.search(dagitty):
            forbidden = ", ".join(
                f"[{t}]" for t in manifest["fields"]["dagitty"]["forbiddenNodeTags"]
            )
            errors.append(
                "dagitty contains non-native role attributes "
                f"({forbidden}). Use structure-only; roles are inferred."
            )
        missing_tags = [t for t in required_dagitty_tags if f"[{t}]" not in dagitty]
        if missing_tags:
            required = " and ".join(f"[{t}]" for t in required_dagitty_tags)
            errors.append(f"dagitty must tag one node {required}")

        dag_nodes, dag_edges = parse_dagitty_edges_and_nodes(dagitty)
        for nid in dag_nodes:
            if nid not in node_keys:
                errors.append(
                    f"Node '{nid}' not in {node_library.relative_to(REPO_ROOT)}/. "
                    "Add via a separate PR."
                )

        evidence = fm.get("evidence") or {}
        if not isinstance(evidence, dict):
            errors.append("evidence must be a mapping")
        else:
            ev_vocab = manifest["fields"]["evidence"]["vocabulary"]
            for key, level in evidence.items():
                errors.extend(
                    validate_closed_vocabulary_value(
                        ev_vocab, str(level), f"evidence '{key}'"
                    )
                )

            def norm_edge_key(key: str) -> str:
                parts = re.split(r"\s*->\s*", key.strip())
                if len(parts) != 2:
                    return key.strip()
                return evidence_key(parts[0], parts[1])

            if manifest["fields"]["evidence"].get("keysMustMatchDagittyEdges"):
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
    alt_spec = manifest["fields"]["alternatives"]
    if not isinstance(alternatives, list):
        errors.append("alternatives must be a list")
    elif alt_spec.get("itemsMustExistAsDagId"):
        for alt_id in alternatives:
            if alt_id not in all_dag_ids:
                errors.append(
                    f"alternatives entry '{alt_id}' does not match an existing DAG id"
                )

    return errors, warnings


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
        errors, warnings = validate_dag(path, node_keys, all_dag_ids)
        if errors:
            failed = True
            print(f"\n{path}:")
            for err in errors:
                print(f"  x {err}")
        elif warnings:
            print(f"ok {path}")
            for warn in warnings:
                print(f"  ! {warn}")
        else:
            print(f"ok {path}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
