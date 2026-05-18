#!/usr/bin/env python3
"""
DAGpedia validation script
Usage: python scripts/validate_dag.py [path/to/dag.md]
       python scripts/validate_dag.py --all
"""

import sys
import glob
import yaml
import os
import asyncio
from pathlib import Path

CONTENT_DIR = Path("src/content")
DAGS_DIR = CONTENT_DIR / "dags"
NODES_DIR = CONTENT_DIR / "nodes"

REQUIRED_FIELDS = [
    "id", "title", "exposure", "outcome",
    "nodes", "evidence_level", "version",
]
VALID_EVIDENCE = {"strong", "moderate", "limited", "theoretical"}


def parse_frontmatter(path: str) -> dict:
    with open(path) as f:
        content = f.read()
    if not content.startswith("---"):
        raise ValueError(f"{path}: frontmatter not found")
    parts = content.split("---", 2)
    return yaml.safe_load(parts[1])


def get_all_node_keys() -> set:
    keys = set()
    for f in glob.glob(str(NODES_DIR / "*.md")):
        fm = parse_frontmatter(f)
        keys.add(fm["key"])
    return keys


def validate_dag(path: str, node_keys: set) -> list[str]:
    errors = []
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


async def validate_mesh_id(session, mesh_id: str) -> bool:
    url = f"https://id.nlm.nih.gov/mesh/{mesh_id}.json"
    try:
        async with session.get(url) as r:
            return r.status == 200
    except Exception:
        return False


async def validate_nodes(paths: list[str]) -> list[str]:
    import aiohttp

    errors = []
    async with aiohttp.ClientSession() as session:
        for path in paths:
            fm = parse_frontmatter(path)
            mesh_id = fm.get("mesh_id")
            if mesh_id:
                valid = await validate_mesh_id(session, mesh_id)
                if not valid:
                    errors.append(
                        f"{path}: MeSH ID '{mesh_id}' not found in NLM API"
                    )
            elif not fm.get("dagpedia_id"):
                errors.append(
                    f"{path}: Either mesh_id or dagpedia_id is required"
                )
    return errors


def main():
    args = sys.argv[1:]
    node_keys = get_all_node_keys()

    if "--all" in args or not args:
        dag_paths = glob.glob(str(DAGS_DIR / "*.md"))
        node_paths = glob.glob(str(NODES_DIR / "*.md"))
    else:
        dag_paths = [p for p in args if "dags/" in p]
        node_paths = [p for p in args if "nodes/" in p]

    all_errors = []

    for path in dag_paths:
        errors = validate_dag(path, node_keys)
        if errors:
            all_errors.extend([f"[{path}] {e}" for e in errors])
        else:
            print(f"OK {path}")

    if node_paths:
        if os.getenv("SKIP_MESH_VALIDATION") == "1":
            print("WARN SKIP_MESH_VALIDATION=1 - skipping MeSH API checks")
        else:
            mesh_errors = asyncio.run(validate_nodes(node_paths))
            all_errors.extend(mesh_errors)

    if all_errors:
        print("\nFAIL Validation failed:")
        for e in all_errors:
            print(f"  {e}")
        sys.exit(1)
    else:
        print("\nOK All validations passed")


if __name__ == "__main__":
    main()
