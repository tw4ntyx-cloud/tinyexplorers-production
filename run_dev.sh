#!/usr/bin/env bash
set -euo pipefail

# Start the backend (background) and the frontend dev server together.
# Backend: http://127.0.0.1:8000/api  ·  Frontend: http://localhost:3000
# Open the site at http://localhost:3000 (not 127.0.0.1) — the API's default
# CORS_ORIGINS only allows http://localhost:3000.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$REPO_DIR/backend/run.sh" &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT INT TERM

# Wait for the API to answer (up to ~20s) before starting the frontend.
for _ in $(seq 1 20); do
  if curl -sf "http://127.0.0.1:${PORT:-8000}/api/health" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend failed to start; see output above." >&2
    exit 1
  fi
  sleep 1
done

cd "$REPO_DIR/frontend"
if [[ ! -d node_modules ]]; then
  npm ci
fi
npm start
