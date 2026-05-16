#!/usr/bin/env bash
set -euo pipefail

pip install -r requirements.txt
python scripts/validate_dag.py docs/dags/
mkdocs build
