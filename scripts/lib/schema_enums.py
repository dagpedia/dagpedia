"""Load allowed enum values from docs/schema/*.md files."""

from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIR = REPO_ROOT / "docs" / "schema"

_ENUM_LINE = re.compile(r"^-\s+`?([a-z0-9][a-z0-9-]*)`?\s*$")


def _parse_enum_file(path: Path) -> set[str]:
    if not path.exists():
        return set()
    values: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        m = _ENUM_LINE.match(line.strip())
        if m:
            values.add(m.group(1))
    return values


def load_populations() -> set[str]:
    return _parse_enum_file(SCHEMA_DIR / "populations.md")


def load_geographics() -> set[str]:
    return _parse_enum_file(SCHEMA_DIR / "geographics.md")


def load_eras() -> set[str]:
    return _parse_enum_file(SCHEMA_DIR / "eras.md")


def load_keywords() -> set[str]:
    return _parse_enum_file(SCHEMA_DIR / "keywords.md")


def load_evidence_levels() -> set[str]:
    return _parse_enum_file(SCHEMA_DIR / "evidence-levels.md")
