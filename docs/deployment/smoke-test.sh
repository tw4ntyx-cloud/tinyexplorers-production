#!/usr/bin/env bash
# Smoke-test a Tiny Explorers API deployment (e.g. the zero-traffic "staging"
# Cloud Run revision). Every record it creates is marked TEST.
#
# Usage:
#   ADMIN_API_KEY=... ./smoke-test.sh <base-url> <test-inbox-email> [--rate-limit]
#
#   <base-url>          e.g. https://staging---tinyexplorers-production-xxxx.us-east1.run.app
#   <test-inbox-email>  an inbox you control; confirmation emails go there
#   --rate-limit        also send 6 rapid enrollments to check the 429 limit
#
# The admin key is read from the environment and never printed.
# Refuses the public production URL unless ALLOW_PRODUCTION=1.
set -euo pipefail

BASE="${1:?base URL required}"; BASE="${BASE%/}"
INBOX="${2:?test inbox email required}"
RATE="${3:-}"

if [[ "$BASE" == *"tinyexplorers-production-784723417768.us-east1.run.app"* && "$BASE" != *"---"* && "${ALLOW_PRODUCTION:-}" != "1" ]]; then
  echo "Refusing to run against the public production URL. Use the tagged staging URL, or set ALLOW_PRODUCTION=1." >&2
  exit 2
fi

pass=0; fail=0
check() { # name expected actual
  if [[ "$3" == "$2" ]]; then echo "PASS  $1 ($3)"; pass=$((pass+1)); else echo "FAIL  $1 (expected $2, got $3)"; fail=$((fail+1)); fi
}
post() { curl -s -o /tmp/smoke_body.$$ -w '%{http_code}' -X POST -H 'Content-Type: application/json' "$BASE$1" -d "$2"; }
stamp="$(date +%s)"
local_part="${INBOX%@*}"; domain="${INBOX#*@}"
alias_email="${local_part}+tetest${stamp}@${domain}"

check "health"                 200 "$(curl -s -o /tmp/smoke_body.$$ -w '%{http_code}' "$BASE/api/health")"
grep -q '"database":"connected"' /tmp/smoke_body.$$ && { echo "PASS  database connected"; pass=$((pass+1)); } || { echo "FAIL  database not connected: $(cat /tmp/smoke_body.$$)"; fail=$((fail+1)); }
check "admin list without key" 401 "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/newsletter")"
if [[ -n "${ADMIN_API_KEY:-}" ]]; then
  check "admin list with key"  200 "$(curl -s -o /dev/null -w '%{http_code}' -H "X-Admin-Key: $ADMIN_API_KEY" "$BASE/api/newsletter")"
fi
check "newsletter signup"      201 "$(post /api/newsletter "{\"email\":\"$alias_email\"}")"
code="$(post /api/newsletter "{\"email\":\"$alias_email\"}")"
grep -q '"already_subscribed":true' /tmp/smoke_body.$$ && { echo "PASS  newsletter duplicate detected ($code)"; pass=$((pass+1)); } || { echo "FAIL  duplicate not detected ($code)"; fail=$((fail+1)); }
check "inquiry phone required" 422 "$(post /api/inquiry "{\"parent_name\":\"TEST smoke\",\"email\":\"$INBOX\",\"child_age\":\"TEST\",\"contact_method\":\"Phone\"}")"
check "inquiry with phone"     201 "$(post /api/inquiry "{\"parent_name\":\"TEST smoke\",\"email\":\"$INBOX\",\"child_age\":\"TEST\",\"contact_method\":\"Phone\",\"phone\":\"+1 441 555 0100\",\"message\":\"TEST smoke test - please ignore\"}")"
check "admissions"             201 "$(post /api/admissions "{\"parent_name\":\"TEST smoke\",\"email\":\"$INBOX\",\"program\":\"TEST\",\"child_focus\":\"TEST smoke test - please ignore\"}")"
check "enrollment"             201 "$(post /api/enrollment "{\"parent_name\":\"TEST smoke\",\"email\":\"$INBOX\",\"child_age\":\"TEST\",\"program\":\"TEST\",\"message\":\"TEST smoke test - please ignore\"}")"
headers="$(curl -s -D - -o /dev/null "$BASE/api/health")"
for h in X-Content-Type-Options X-Frame-Options Strict-Transport-Security; do
  grep -qi "^$h:" <<<"$headers" && { echo "PASS  header $h"; pass=$((pass+1)); } || { echo "FAIL  missing header $h"; fail=$((fail+1)); }
done

if [[ "$RATE" == "--rate-limit" ]]; then
  last=""
  for i in 1 2 3 4 5 6; do
    last="$(post /api/enrollment "{\"parent_name\":\"TEST rate $i\",\"email\":\"$INBOX\",\"child_age\":\"TEST\",\"program\":\"TEST\"}")"
  done
  check "rate limit (6th enrollment within a minute)" 429 "$last"
  echo "      Now confirm a request from a DIFFERENT network still returns 201 (per-client limits)."
fi

rm -f /tmp/smoke_body.$$
echo "----"; echo "$pass passed, $fail failed. Check $INBOX and hello@ for the confirmation/notification emails."
[[ $fail -eq 0 ]]
