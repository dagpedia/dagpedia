"""Load DAG validation rules from docs/schema/ (single source of truth)."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIR = REPO_ROOT / "docs" / "schema"
MANIFEST_PATH = SCHEMA_DIR / "dag-validation.json"


@dataclass(frozen=True)
class VocabularyEntry:
    id: str
    label: str
    description: str | None = None


@dataclass(frozen=True)
class Vocabulary:
    key: str
    open: bool
    entries: tuple[VocabularyEntry, ...]

    @property
    def suggested_ids(self) -> set[str]:
        return {e.id for e in self.entries}

    @property
    def labels(self) -> dict[str, str]:
        return {e.id: e.label for e in self.entries}


def _slug_pattern() -> re.Pattern[str]:
    manifest = load_manifest()
    return re.compile(manifest.get("slugPattern", r"^[a-z0-9]+(-[a-z0-9]+)*$"))


@lru_cache(maxsize=1)
def load_manifest() -> dict:
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        return json.load(f)


def _vocabulary_file_path(vocabulary_key: str) -> Path:
    manifest = load_manifest()
    vocabs = manifest.get("vocabularies") or manifest.get("enumFiles", {})
    entry = vocabs.get(vocabulary_key)
    if entry is None:
        raise KeyError(f"Unknown vocabulary key '{vocabulary_key}' in dag-validation.json")
    filename = entry["file"] if isinstance(entry, dict) else entry
    return SCHEMA_DIR / filename


def _parse_vocabulary_entry(path: Path, raw: object) -> VocabularyEntry:
    if isinstance(raw, dict):
        entry_id = raw.get("id")
        label = raw.get("label")
        if not isinstance(entry_id, str) or not _slug_pattern().match(entry_id):
            raise ValueError(f"{path}: invalid id '{entry_id}'")
        if not isinstance(label, str) or not label.strip():
            raise ValueError(f"{path}: label for '{entry_id}' must be a non-empty string")
        desc = raw.get("description")
        if desc is not None and (not isinstance(desc, str) or not desc.strip()):
            raise ValueError(f"{path}: description for '{entry_id}' must be non-empty when set")
        return VocabularyEntry(
            id=entry_id,
            label=label.strip(),
            description=desc.strip() if isinstance(desc, str) else None,
        )
    raise ValueError(f"{path}: each entry must be {{id, label, description?}}, got {raw!r}")


def _resolve_vocabulary_section(
    path: Path, vocabulary_key: str, data: dict
) -> tuple[list, bool]:
    bundled = data.get("vocabularies")
    if not isinstance(bundled, dict):
        raise ValueError(f"{path}: root must contain 'vocabularies' mapping")
    if vocabulary_key not in bundled:
        raise ValueError(
            f"{path}: vocabularies.{vocabulary_key} not found "
            f"(keys: {sorted(bundled)})"
        )
    section = bundled[vocabulary_key]
    if not isinstance(section, dict):
        raise ValueError(f"{path}: vocabularies.{vocabulary_key} must be a mapping")
    entries_raw = section.get("entries")
    if not isinstance(entries_raw, list) or len(entries_raw) == 0:
        raise ValueError(
            f"{path}: vocabularies.{vocabulary_key}.entries must be a non-empty list"
        )
    return entries_raw, bool(section.get("open", True))


@lru_cache(maxsize=32)
def load_vocabulary(vocabulary_key: str) -> Vocabulary:
    path = _vocabulary_file_path(vocabulary_key)
    if not path.exists():
        raise FileNotFoundError(f"Vocabulary file not found: {path}")
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"{path}: root must be a mapping")
    entries_raw, open_vocab = _resolve_vocabulary_section(path, vocabulary_key, data)
    seen: set[str] = set()
    entries: list[VocabularyEntry] = []
    for raw in entries_raw:
        entry = _parse_vocabulary_entry(path, raw)
        if entry.id in seen:
            raise ValueError(f"{path}: duplicate id '{entry.id}'")
        seen.add(entry.id)
        entries.append(entry)
    return Vocabulary(key=vocabulary_key, open=open_vocab, entries=tuple(entries))


def validate_slug(value: str, field_name: str) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return f"{field_name} is required"
    if not _slug_pattern().match(value):
        return (
            f"Invalid {field_name}: '{value}' "
            f"(must match slug pattern {_slug_pattern().pattern})"
        )
    return None


def validate_open_vocabulary_value(
    vocabulary_key: str, value: str, field_name: str
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    err = validate_slug(value, field_name)
    if err:
        errors.append(err)
        return errors, warnings
    vocab = load_vocabulary(vocabulary_key)
    if not vocab.open:
        errors.append(f"{field_name}: vocabulary '{vocabulary_key}' is not open")
        return errors, warnings
    if value not in vocab.suggested_ids:
        warnings.append(
            f"{field_name}: '{value}' is not in suggested {vocabulary_key} "
            f"({sorted(vocab.suggested_ids)}); custom slugs are allowed"
        )
    return errors, warnings


def validate_closed_vocabulary_value(
    vocabulary_key: str, value: str, field_name: str
) -> list[str]:
    errors: list[str] = []
    err = validate_slug(value, field_name)
    if err:
        errors.append(err)
        return errors
    vocab = load_vocabulary(vocabulary_key)
    if vocab.open:
        errors.append(f"{field_name}: vocabulary '{vocabulary_key}' must be closed")
        return errors
    if value not in vocab.suggested_ids:
        errors.append(
            f"Invalid {field_name}: '{value}'. Must be one of {sorted(vocab.suggested_ids)}"
        )
    return errors


def vocabulary_label(vocabulary_key: str, entry_id: str) -> str:
    vocab = load_vocabulary(vocabulary_key)
    return vocab.labels.get(entry_id, humanize_slug(entry_id))


def humanize_slug(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.split("-"))


def load_evidence_levels() -> set[str]:
    return load_vocabulary("evidenceLevels").suggested_ids


def load_evidence_level_legend() -> list[tuple[str, str, str]]:
    vocab = load_vocabulary("evidenceLevels")
    out: list[tuple[str, str, str]] = []
    for e in vocab.entries:
        if not e.description:
            raise ValueError(
                f"evidenceLevels: entry '{e.id}' requires description for legend"
            )
        out.append((e.id, e.label, e.description))
    return out


def load_enum(vocabulary_key: str) -> set[str]:
    return load_vocabulary(vocabulary_key).suggested_ids


def load_populations() -> set[str]:
    return load_enum("populations")


def load_geographics() -> set[str]:
    return load_enum("geographics")


def load_eras() -> set[str]:
    return load_enum("eras")


def load_keywords() -> set[str]:
    return load_enum("keywords")


def get_enum_registry(vocabulary_key: str) -> dict:
    manifest = load_manifest()
    vocabs = manifest.get("vocabularies") or manifest.get("enumFiles", {})
    entry = vocabs[vocabulary_key]
    if isinstance(entry, str):
        return {"file": entry, "field": "", "wiredAt": ""}
    return dict(entry)


def get_required_frontmatter() -> list[str]:
    return list(load_manifest()["requiredFrontmatter"])


def get_id_pattern() -> re.Pattern[str]:
    return re.compile(load_manifest()["fields"]["id"]["pattern"])


def get_title_max_length() -> int:
    return int(load_manifest()["fields"]["title"]["maxLength"])


def get_context_note_max_length() -> int:
    return int(load_manifest()["fields"]["context"]["properties"]["note"]["maxLength"])


def get_forbidden_dagitty_tags() -> list[str]:
    return list(load_manifest()["fields"]["dagitty"]["forbiddenNodeTags"])


def get_required_dagitty_tags() -> list[str]:
    return list(load_manifest()["fields"]["dagitty"]["requiredNodeTags"])


def get_forbidden_dagitty_pattern() -> re.Pattern[str]:
    tags = "|".join(re.escape(t) for t in get_forbidden_dagitty_tags())
    return re.compile(rf"\[({tags})\]", re.IGNORECASE)


def get_node_library_path() -> Path:
    rel = load_manifest()["fields"]["dagitty"]["nodeLibraryPath"]
    return REPO_ROOT / rel
