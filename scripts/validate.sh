#!/usr/bin/env bash
set -euo pipefail

echo "Shadow313 validation starting..."

echo "Checking JSON files..."

find . \
  -name "*.json" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./.venv/*" \
  -exec python -m json.tool {} \; > /dev/null

echo "Checking Python syntax..."

python -m py_compile aegis_ultimate.py
python -m py_compile backend/main.py

echo "Checking JavaScript syntax..."

find api sentinelos/js \
  -name "*.js" \
  -exec node --check {} \;

echo "Validation complete."
