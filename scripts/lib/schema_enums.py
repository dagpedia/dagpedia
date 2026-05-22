"""Backward-compatible re-exports. Prefer scripts.lib.schema_loader."""

from lib.schema_loader import (
    load_eras,
    load_evidence_levels,
    load_geographics,
    load_keywords,
    load_populations,
)

__all__ = [
    "load_eras",
    "load_evidence_levels",
    "load_geographics",
    "load_keywords",
    "load_populations",
]
