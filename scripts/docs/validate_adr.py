#!/usr/bin/env python3
"""
Validate ADR markdown under docs/adr/.
Usage:
  python scripts/docs/validate_adr.py docs/adr/2026-05-16-001-content-license.md
  python scripts/docs/validate_adr.py --all
"""

from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

import yaml

from generate_docs_index import generate_docs_index

REPO_ROOT = Path(__file__).resolve().parents[2]
ADR_DIR = REPO_ROOT / "docs/adr"
FILENAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-(\d{3})-([a-z0-9-]+)\.md$")
STEM_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-\d{3}-[a-z0-9-]+$")
VALID_STATUS = {"proposed", "accepted", "deprecated", "superseded"}
REQUIRED_SECTIONS = [
    "Context and Problem Statement",
    "Considered Options",
    "Decision Outcome",
]


def parse_file(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8-sig")
    if not text.startswith("---"):
        raise ValueError("frontmatter not found")
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError("malformed frontmatter")
    meta = yaml.safe_load(parts[1]) or {}
    body = parts[2].lstrip("\n")
    return meta, body


def validate_frontmatter(path: Path, meta: dict) -> list[str]:
    errors: list[str] = []
    match = FILENAME_RE.match(path.name)
    if not match:
        errors.append(
            "filename must match YYYY-MM-DD-NNN-slug.md "
            "(e.g. 2026-05-16-001-content-license.md)"
        )
        return errors

    file_date = match.group(1)
    file_sequence = int(match.group(2))

    if not isinstance(meta, dict) or not meta:
        errors.append("frontmatter is empty")
        return errors

    for field in ("date", "sequence", "title", "status"):
        if field not in meta:
            errors.append(f"missing required frontmatter field: '{field}'")

    seq = meta.get("sequence")
    if seq is not None:
        if not isinstance(seq, int):
            errors.append(f"'sequence' must be an integer, got {type(seq).__name__}")
        elif seq != file_sequence:
            errors.append(
                f"'sequence' {seq} must match filename sequence {file_sequence:03d}"
            )
        elif seq < 1 or seq > 999:
            errors.append("'sequence' must be between 1 and 999")

    d = meta.get("date")
    if d is not None:
        if not isinstance(d, str):
            errors.append("'date' must be an ISO date string (YYYY-MM-DD)")
        else:
            try:
                date.fromisoformat(d)
            except ValueError:
                errors.append(f"invalid date '{d}'")
            else:
                if d != file_date:
                    errors.append(
                        f"'date' {d} must match filename date prefix {file_date}"
                    )

    title = meta.get("title")
    if title is not None and (not isinstance(title, str) or not title.strip()):
        errors.append("'title' must be a non-empty string")

    status = meta.get("status")
    if status is not None:
        if not isinstance(status, str) or status not in VALID_STATUS:
            errors.append(
                f"invalid status '{status}'; must be one of {sorted(VALID_STATUS)}"
            )

    status_note = meta.get("status_note")
    if status_note is not None and (
        not isinstance(status_note, str) or not status_note.strip()
    ):
        errors.append("'status_note' must be a non-empty string")

    for field in ("tags", "related", "supersedes"):
        val = meta.get(field)
        if val is None:
            continue
        if not isinstance(val, list):
            errors.append(f"'{field}' must be a list")
            continue
        for item in val:
            if field == "tags":
                if not isinstance(item, str) or not re.fullmatch(
                    r"[a-z0-9-]+", item
                ):
                    errors.append(
                        f"'{field}' items must be lowercase slug strings"
                    )
            elif not isinstance(item, str) or not STEM_RE.fullmatch(item):
                errors.append(
                    f"'{field}' items must be ADR file stems "
                    "(e.g. 2026-05-16-005-defer-tier-system)"
                )

    superseded_by = meta.get("superseded_by")
    if superseded_by is not None and (
        not isinstance(superseded_by, str) or not STEM_RE.fullmatch(superseded_by)
    ):
        errors.append(
            "'superseded_by' must be an ADR file stem "
            "(e.g. 2026-05-18-001-nextjs-site)"
        )

    allowed = {
        "date",
        "sequence",
        "title",
        "status",
        "status_note",
        "tags",
        "related",
        "supersedes",
        "superseded_by",
    }
    extra = set(meta) - allowed
    if extra:
        errors.append(f"unknown frontmatter fields: {sorted(extra)}")

    return errors


def validate_body(path: Path, meta: dict, body: str) -> list[str]:
    errors: list[str] = []
    title = meta.get("title", "")
    expected_h1 = f"# {title}" if title else None

    lines = body.splitlines()
    if not lines:
        errors.append("body is empty")
        return errors

    if expected_h1 and lines[0].strip() != expected_h1:
        errors.append(f"H1 must be exactly: {expected_h1}")

    if re.search(r"^## Status\s*$", body, re.MULTILINE):
        errors.append(
            "remove '## Status' from body; use frontmatter 'status' instead"
        )

    for section in REQUIRED_SECTIONS:
        if not re.search(rf"^## {re.escape(section)}\s*$", body, re.MULTILINE):
            errors.append(f"missing required section: '## {section}'")

    if not re.search(r"^### Consequences\s*$", body, re.MULTILINE):
        errors.append("missing required subsection: '### Consequences'")

    if not re.search(r"^## References\s*$", body, re.MULTILINE):
        errors.append("missing required section: '## References'")

    return errors


def validate_adr(path: Path, known_stems: set[str]) -> list[str]:
    errors: list[str] = []
    try:
        meta, body = parse_file(path)
    except Exception as exc:
        return [f"parse error: {exc}"]

    errors.extend(validate_frontmatter(path, meta))
    if not errors:
        errors.extend(validate_body(path, meta, body))

    stem = path.stem
    for rel in meta.get("related", []) + meta.get("supersedes", []):
        if isinstance(rel, str) and rel not in known_stems:
            errors.append(f"references unknown ADR '{rel}'")
    sb = meta.get("superseded_by")
    if isinstance(sb, str):
        if sb not in known_stems:
            errors.append(f"superseded_by references unknown ADR '{sb}'")
        if sb == stem:
            errors.append("superseded_by cannot reference self")

    return errors


def resolve_adr_path(arg: str) -> Path:
    path = Path(arg)
    if path.is_file():
        return path.resolve()
    candidate = REPO_ROOT / path
    if candidate.is_file():
        return candidate
    return path


def validate_unique_sequences(paths: list[Path]) -> list[str]:
    errors: list[str] = []
    seen: dict[tuple[str, int], Path] = {}
    for path in paths:
        match = FILENAME_RE.match(path.name)
        if not match:
            continue
        key = (match.group(1), int(match.group(2)))
        if key in seen:
            errors.append(
                f"duplicate sequence {key[1]:03d} on {key[0]}: "
                f"{seen[key].name} and {path.name}"
            )
        else:
            seen[key] = path
    return errors


def collect_adr_paths(args: list[str]) -> list[Path]:
    if "--all" in args or not args:
        return sorted(
            p
            for p in ADR_DIR.glob("*.md")
            if p.name != "README.md" and FILENAME_RE.match(p.name)
        )
    return [
        resolve_adr_path(p)
        for p in args
        if FILENAME_RE.match(Path(p).name)
    ]


def main() -> None:
    paths = collect_adr_paths(sys.argv[1:])
    if not paths:
        print("No ADR files found.")
        sys.exit(1)

    known_stems = {p.stem for p in paths}

    all_errors: list[str] = validate_unique_sequences(paths)

    for path in paths:
        errors = validate_adr(path, known_stems)
        if errors:
            all_errors.extend(f"[{path}] {e}" for e in errors)
        else:
            print(f"OK {path}")

    if all_errors:
        print("\nFAIL ADR validation failed:")
        for err in all_errors:
            print(f"  {err}")
        sys.exit(1)

    count = generate_docs_index()
    print(f"Updated docs/MAP.md ({count} ADRs)")
    print(f"\nOK {len(paths)} ADR(s) validated")


if __name__ == "__main__":
    main()
