#!/usr/bin/env python3
"""
Validate node markdown under src/content/nodes/.
Usage:
  python scripts/nodes/validate_nodes.py [path/to/node.md]
  python scripts/nodes/validate_nodes.py --all
"""

from __future__ import annotations

import asyncio
import glob
import os
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
NODES_DIR = REPO_ROOT / "src/content/nodes"


def parse_frontmatter(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    if not content.startswith("---"):
        raise ValueError(f"{path}: frontmatter not found")
    parts = content.split("---", 2)
    return yaml.safe_load(parts[1])


def get_all_node_keys() -> set[str]:
    keys: set[str] = set()
    for f in glob.glob(str(NODES_DIR / "*.md")):
        fm = parse_frontmatter(f)
        keys.add(fm["key"])
    return keys


async def validate_mesh_id(session, mesh_id: str) -> bool:
    url = f"https://id.nlm.nih.gov/mesh/{mesh_id}.json"
    try:
        async with session.get(url) as r:
            return r.status == 200
    except Exception:
        return False


async def validate_node_paths(paths: list[str]) -> list[str]:
    try:
        import aiohttp
    except ImportError:
        return ["aiohttp is required: pip install aiohttp"]

    errors: list[str] = []
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


def collect_paths(args: list[str]) -> list[str]:
    if "--all" in args or not args:
        return glob.glob(str(NODES_DIR / "*.md"))
    return [p for p in args if "nodes/" in p or Path(p).parent.name == "nodes"]


def main() -> None:
    paths = collect_paths(sys.argv[1:])
    if not paths:
        print("No node files found.")
        sys.exit(1)

    all_errors: list[str] = []

    if os.getenv("SKIP_MESH_VALIDATION") == "1":
        print("WARN SKIP_MESH_VALIDATION=1 - skipping node validation")
    else:
        all_errors.extend(asyncio.run(validate_node_paths(paths)))

    for path in paths:
        if not any(e.startswith(path) for e in all_errors):
            print(f"OK {path}")

    if all_errors:
        print("\nFAIL Node validation failed:")
        for err in all_errors:
            print(f"  {err}")
        sys.exit(1)

    print(f"\nOK {len(paths)} node(s) validated")


if __name__ == "__main__":
    main()
