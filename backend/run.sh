#!/usr/bin/env bash
set -euo pipefail

# Run the backend FastAPI app using the workspace virtualenv python if available.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON=${PYTHON:-/workspaces/tinyexplorersv3/.venv/bin/python}

cd "$ROOT_DIR"
exec "$PYTHON" -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
