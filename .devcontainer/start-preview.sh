#!/usr/bin/env bash
set -euo pipefail

# Start the site in SAFE PREVIEW MODE for review (Codespaces or local).
# Explicitly overrides anything that could reach production, even if
# Codespaces secrets or a backend/.env define them:
#   - no MongoDB  -> in-memory store, cleared on restart
#   - no Resend   -> emails are logged, never sent
#   - no Google Workspace newsletter sync
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if curl -sf "http://127.0.0.1:${PORT:-8000}/api/health" >/dev/null 2>&1; then
  echo "Preview is already running — open the forwarded port 3000 (Ports tab)."
  exit 0
fi

export ENVIRONMENT=development
export MONGO_URL=""
export RESEND_API_KEY=""
export GOOGLE_SERVICE_ACCOUNT_EMAIL="" GOOGLE_SERVICE_ACCOUNT_JSON=""
export ADMIN_API_KEY="${ADMIN_API_KEY:-preview-only-admin-key}"
unset REACT_APP_BACKEND_URL

echo "Starting Tiny Explorers in safe preview mode (test data only; nothing is saved or emailed)."
exec "$REPO_DIR/run_dev.sh"
