# Tiny Explorers — Development Handoff

_Last updated: 2026-10-19. Read this first in any new session, then
PRODUCTION_READINESS.md and DEVELOPMENT_ROADMAP.md._

## Current state (one paragraph)

The site is a React SPA with a FastAPI + MongoDB API. All forms work end to end in local testing: newsletter, admissions, inquiry and enrollment. Tests pass (frontend 16, backend 78) and the production build succeeds.

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

There are no open PRs. Related private repos (`tinyexplorers-admin`, `tinyexplorersv3`, `tinyexplorersv4-wp`, `tinyexplorers`) are older and have **not** been inspected.

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

Do **not** use `run_dev.sh` or `backend/run.sh`. They hard-code paths from the old `tinyexplorersv3` workspace.

## Known issues (details in PRODUCTION_READINESS.md)

- `npm ci` fails if `assets.emergent.sh` is unreachable. The cause is the leftover devDependency `@emergentbase/visual-edits`, which is optional at runtime. Workaround until roadmap item 1.3 lands: in a scratch copy, remove the dependency from `package.json` and from `package-lock.json` (`packages[""].devDependencies` and `node_modules/@emergentbase/visual-edits`), then run `npm ci`.
- Mobile clipping in the homepage Environment section (H1).
- Conflicting street addresses (C2).
- The inquiry form's "Phone" option has no phone field (H7).
- Resend calls block the event loop (H2). Rate limiting is likely shared by all users on Cloud Run (H3).
- CI runs only `tests/test_api.py`; run the other backend tests locally.

## Completed work (this session)

- Full repository recovery and audit. Local install, test and build. Browser testing at desktop and mobile widths. Dependency and secret scans.
- Added PROJECT_OVERVIEW.md, PRODUCTION_READINESS.md, DEVELOPMENT_ROADMAP.md, DEVELOPMENT_HANDOFF.md and CHANGELOG.md.
- No application code, config, infrastructure or data was changed.

## Remaining tasks

See DEVELOPMENT_ROADMAP.md. The next step is **Milestone 0** (owner actions, especially rotating the Atlas password), followed by **Milestone 1** (safe hardening, ~3–4 days) once approved.

## Instructions for a future Claude session

1. `git fetch origin && git status`. Work on the designated `claude/...` branch and never push to `main` without approval.
2. Read this file, then PRODUCTION_READINESS.md (finding IDs) and DEVELOPMENT_ROADMAP.md (task IDs). Reference those IDs in commits, e.g. `fix(frontend): H1 environment grid overflow on mobile`.
3. Before claiming a change works, run the frontend tests, the frontend build, and both backend test commands above. For UI changes, also check 360/390/768/1440px in Playwright (`/opt/pw-browsers/chromium` in cloud sessions).
4. Never print secrets. Never commit `.env`. Treat `backend/tests` fixtures as public: the repo is public.
5. Update CHANGELOG.md and the "Completed work" / "Remaining tasks" sections here with each milestone.
6. The live hosts (Pages, Cloud Run, Atlas, Resend) may be unreachable from cloud sandboxes. Say so rather than assuming they work.
