# Tiny Explorers — Development Handoff

_Last updated: 2026-10-19 (Milestone 1 complete on branch). Read this first in any new session, then
PRODUCTION_READINESS.md and DEVELOPMENT_ROADMAP.md._

## Current state (one paragraph)

The site is a React SPA with a FastAPI + MongoDB API. All forms work end to end in local testing: newsletter, admissions, inquiry and enrollment. Tests pass (frontend 20, backend 76 unit + 22 live API) and the production build succeeds. Milestone 1 hardening is complete on the work branch, not yet merged or deployed.

A preview is auto-deployed from `main` to GitHub Pages (`https://tw4ntyx-cloud.github.io/tinyexplorers-production/`). The API runs on Google Cloud Run (`https://tinyexplorers-production-784723417768.us-east1.run.app`), with Resend and MongoDB Atlas configured according to the commit history. The real domain `tinyexplorersbda.com` is **not connected yet**.

Launch is blocked mainly by owner decisions (address, factual claims, photos, privacy policy), a possible credential exposure in this **public** repo, and the domain cutover. See PRODUCTION_READINESS.md §2.

## Important decisions already made (from repo history)

- **Google Cloud Run is the API host.** It enables keyless Google Workspace auth; the org blocks service-account key creation.
- **Google Calendar appointment schedule is the source of truth for tours.** There is no tour API.
- **No phone number is published** until a real one is verified. `hello@tinyexplorersbda.com` is the canonical contact.
- **Production fails closed.** It refuses to start without a real `MONGO_URL`, returns 503 if Atlas is unreachable, and denies admin endpoints if `ADMIN_API_KEY` is unset.
- **Email failures never lose submissions.** The DB write happens first; email errors are logged and swallowed. Tests cover this.
- **Domain/URL configuration is environment-driven** where possible (`REACT_APP_WEBSITE_URL`, `WEBSITE_URL`). Some static files still need manual changes (C3).
- **Process rules for this handoff:** no redesigns, infrastructure migrations, DB changes or deployments without owner approval. Never merge to `main` without approval. No force-pushes.

## Repository and branches

| Branch | Purpose |
|---|---|
| `main` | Source of truth; pushes trigger CI and a GitHub Pages deploy. Unprotected. |
| `gh-pages` | Build output, force-published by the workflow. **Do not edit by hand.** |
| `claude/trusting-ramanujan-v9r2or` | Production-preparation work branch (this audit). |

There are no open PRs. `tinyexplorers-admin` (private) was inspected read-only on 2026-10-19: it is an **empty placeholder** (one README, one auto-generated commit), so there is no admin dashboard to preserve. Other private repos (`tinyexplorersv3`, `tinyexplorersv4-wp`, `tinyexplorers`) are older and not inspected.

**Deployment triggers:** a merge to `main` redeploys the **GitHub Pages preview** automatically. No workflow in this repo deploys the backend. How Cloud Run is updated (manual `gcloud`, or a Cloud Build trigger connected to the repo) is **unknown**. Check before merging, because a Cloud Build trigger would deploy backend changes on merge.

## Commands to start development

Prerequisites: Node 20, Python 3.11+.

```bash
# Backend (in-memory DB when MONGO_URL is empty; email logged instead of sent)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt pytest requests
cp .env.example .env              # leave secrets blank for local dev
uvicorn server:app --reload --port 8000     # http://localhost:8000/api/health

# Backend tests
ENVIRONMENT=development MONGO_URL= ADMIN_API_KEY=test python -m pytest tests -q --ignore=tests/test_api.py
# API tests need the server running (see .github/workflows/ci.yml):
REACT_APP_BACKEND_URL=http://127.0.0.1:8000 ADMIN_API_KEY=test python -m pytest tests/test_api.py -q
#   (start uvicorn with the same ADMIN_API_KEY)

# Frontend
cd frontend
cp .env.example .env              # REACT_APP_BACKEND_URL=http://localhost:8000
npm ci                            # see "Known issues" if this fails with 403
npm start                         # http://localhost:3000 (must be localhost, not 127.0.0.1, for CORS)
CI=true npm test -- --watchAll=false
CI=true npm run build
```

One-command alternative (after creating `backend/.venv` once): `./run_dev.sh`. It starts the API, waits for `/api/health`, then starts the frontend; Ctrl+C stops both.

New backend settings: `TRUSTED_PROXY_HOPS` (0 locally; **1 on Cloud Run**) and `EMAIL_SEND_TIMEOUT_SECONDS` (default 10). See `backend/.env.example`.

## Known issues (details in PRODUCTION_READINESS.md §0/§2)

- **C1:** the Atlas password from commit `ba4f124` must be rotated by the owner. Steps: `docs/security/2026-10-mongodb-credential-exposure.md`.
- **Content:** contradictions (address, ratios, kitchen) and unverified claims (named nurse, security, qualifications, dates) are awaiting the owner. See `docs/OWNER_CONFIRMATIONS.md`. **Do not change business facts without approval.**
- **H3:** the rate-limit fix needs `TRUSTED_PROXY_HOPS=1` on Cloud Run, plus a check on a no-traffic revision.
- **H8:** before deploying, look for duplicate `newsletter.email` values in production, or the unique index is skipped (logged).
- **react-router 6.x advisories** remain. They are not reachable here; fixing them needs v7 (deferred).
- **GitHub Pages:** serves deep links with HTTP 404 (`404.html` redirect) and cannot send security headers. Acceptable for the preview only.
- **CRA:** deprecated, and ~96 build-tool npm advisories remain (none are shipped to browsers).

## Completed work

**Session 1 (audit):** repository recovery, local install, test and build, browser testing, dependency and secret scans. Added PROJECT_OVERVIEW, PRODUCTION_READINESS, DEVELOPMENT_ROADMAP, this file and CHANGELOG.

**Session 1 (Milestone 1, approved by owner), commits on `claude/trusting-ramanujan-v9r2or`:**

| Commit | Change |
|---|---|
| `386c65e` | Security: synthetic test credentials; exposure write-up and rotation steps |
| `a16f212` | H1 mobile clipping fix (Environment) |
| `6568656` | H7 inquiry phone field (frontend and backend, with tests) |
| `3fa64a0` | H5 remove Emergent dependency |
| `cb3e5e7` | H2 non-blocking, bounded email sending; PII-masked logs |
| `e2178e2` | H3 trusted-proxy rate-limit key; H8 indexes and newsletter race handling |
| `6fa1f32` | H4 backend dependency upgrades; FastAPI lifespan |
| `ed64963` | H4 axios 1.20.0 |
| `49e1827` | Dev scripts repaired; CI runs all backend tests |

Test results at completion:
- Frontend: 20/20.
- Backend unit tests: 76/76 (Python 3.11).
- Live API tests: 22/22.
- Production build and the GitHub Pages artifact checks pass.
- `pip-audit` clean.
- Browser-verified: mobile layout and the inquiry phone flow.

**Nothing has been merged to `main` or deployed.**

**Session 2 (Milestone 2 preparation):**
- Fixed blank page on `npm start`: dev server now serves at `/` via `frontend/.env.development`.
- Dev `/api` proxy (`frontend/src/setupProxy.js`).
- Codespaces safe preview (`.devcontainer/`).
- Found that a **Cloud Build trigger deploys `main` to Cloud Run automatically** (`docs/deployment/DEPLOYMENT_BEHAVIOR.md`).
- Wrote the gated rotation runbook, the staging plan with smoke test, the owner questionnaire, the admin evaluation and the visual review.
- Browser walkthrough at 1440/834/390: all pages render; all 4 forms submit (test data, in-memory); modals and the mobile menu work; reduced motion is respected.

**How to preview the branch:**
- **Codespaces:** https://codespaces.new/tw4ntyx-cloud/tinyexplorers-production?ref=claude/trusting-ramanujan-v9r2or. This starts safe preview mode automatically; port 3000 is private.
- **Locally:** `./run_dev.sh`, or `.devcontainer/start-preview.sh` for forced safe mode.
- The public preview (https://tw4ntyx-cloud.github.io/tinyexplorers-production/) shows `main` and is wired to the **production** API and email. **Do not submit forms there for testing.**

## Remaining tasks

See DEVELOPMENT_ROADMAP.md.
- **Milestone 0:** owner actions, especially the C1 rotation and the content answers.
- **Milestone 2:** rotation runbook (owner, gated); staging revision; then merge (auto-deploys!); content updates; admin safety net; hosting cutover later.
- **Next owner step:** rotation runbook **Step 1** (read-only inspection), then report back.

## Instructions for a future Claude session

1. `git fetch origin && git status`. Work on the designated `claude/...` branch and never push to `main` without approval.
2. Read this file, then PRODUCTION_READINESS.md (finding IDs) and DEVELOPMENT_ROADMAP.md (task IDs). Reference those IDs in commits, e.g. `fix(frontend): H1 environment grid overflow on mobile`.
3. Before claiming a change works, run the frontend tests, the frontend build, and both backend test commands above. For UI changes, also check 360/390/768/1440px in Playwright (`/opt/pw-browsers/chromium` in cloud sessions).
4. Never print secrets. Never commit `.env`. **Test fixtures must use synthetic hosts, usernames and passwords**: the repo is public, and a realistic fixture caused incident C1.
5. Update CHANGELOG.md and the "Completed work" / "Remaining tasks" sections here with each milestone.
6. The live hosts (Pages, Cloud Run, Atlas, Resend) may be unreachable from cloud sandboxes. Say so rather than assuming they work.
