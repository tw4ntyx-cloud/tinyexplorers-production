#!/usr/bin/env bash
set -euo pipefail

# Start backend in background, then start frontend dev server.
# Backend: uses backend/run.sh which picks the workspace venv Python by default.
/workspaces/tinyexplorersv3/backend/run.sh &

# Give backend a second to boot
sleep 2

# Start frontend (assumes npm is available in PATH)
cd /workspaces/tinyexplorersv3/frontend
npm install --silent
npm run start
