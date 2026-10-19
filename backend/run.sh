#!/usr/bin/env bash
set -euo pipefail

# Run the FastAPI backend for local development with auto-reload.
# Uses backend/.venv if it exists, otherwise python3 on PATH; override with
# PYTHON=/path/to/python. HOST/PORT default to 127.0.0.1:8000.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "${PYTHON:-}" ]]; then
  if [[ -x "$ROOT_DIR/.venv/bin/python" ]]; then
    PYTHON="$ROOT_DIR/.venv/bin/python"
  else
    PYTHON="$(command -v python3)"
  fi
fi

if ! "$PYTHON" -c "import fastapi, uvicorn" 2>/dev/null; then
  echo "Backend dependencies are missing for $PYTHON." >&2
  echo "Set up once with:" >&2
  echo "  cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi

cd "$ROOT_DIR"
exec "$PYTHON" -m uvicorn server:app --host "${HOST:-127.0.0.1}" --port "${PORT:-8000}" --reload
