#!/usr/bin/env bash
set -euo pipefail

# PRIVATE STAGING COPY: the production build of this branch, served the way a
# static host serves it, with the backend in SAFE MODE:
#   - no MongoDB  -> in-memory store, cleared on restart
#   - no Resend   -> emails are logged, never sent
#   - no Google Workspace newsletter sync
# Nothing here can reach the live database, send email, or change production.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGING_PORT="${STAGING_PORT:-4000}"

export ENVIRONMENT=development
export MONGO_URL=""
export RESEND_API_KEY=""
export GOOGLE_SERVICE_ACCOUNT_EMAIL="" GOOGLE_SERVICE_ACCOUNT_JSON=""
export ADMIN_API_KEY="${ADMIN_API_KEY:-staging-only-admin-key}"

if ! curl -sf "http://127.0.0.1:${PORT:-8000}/api/health" >/dev/null 2>&1; then
  "$REPO_DIR/backend/run.sh" &
  for _ in $(seq 1 20); do
    curl -sf "http://127.0.0.1:${PORT:-8000}/api/health" >/dev/null 2>&1 && break
    sleep 1
  done
fi

cd "$REPO_DIR/frontend"
[[ -d node_modules ]] || npm ci
# Same-origin API, root base path, staging label, never indexed.
REACT_APP_BACKEND_URL="" PUBLIC_URL="/" REACT_APP_WEBSITE_URL="http://localhost:${STAGING_PORT}" \
  REACT_APP_ROBOTS="noindex, nofollow" \
  REACT_APP_ENV_LABEL="Private staging · test data only, nothing saved or emailed" \
  npm run build
STAGING_PORT="$STAGING_PORT" exec node scripts/staging-server.js
