# Changelog

All notable changes to this project are recorded here. Dates are UTC.
History before this file existed is summarised from `git log`.

## [Unreleased]

### Security
- 2026-10-19 — Replaced a realistic MongoDB Atlas connection string in
  `backend/tests/test_mongo_url_validation.py` with synthetic values; documented the
  exposure and owner rotation steps (`docs/security/`). Credential rotation pending.
- 2026-10-19 — Upgraded vulnerable backend dependencies (FastAPI 0.146 / Starlette 1.9,
  PyMongo 4.19 / Motor 3.7.1, cryptography 50, python-multipart, urllib3, requests,
  anyio, python-dotenv); removed unused python-jose, passlib, PyJWT, bcrypt; axios 1.20.0.

### Fixed
- 2026-10-19 — Homepage "Our Environment" text clipped on phones (360–390px).
- 2026-10-19 — Email delivery no longer blocks the API event loop; bounded wait
  (`EMAIL_SEND_TIMEOUT_SECONDS`); parent emails masked in logs.
- 2026-10-19 — Rate limits can identify real clients behind Cloud Run
  (`TRUSTED_PROXY_HOPS`); spoofed `X-Forwarded-For` prefixes ignored.
- 2026-10-19 — Concurrent duplicate newsletter signups: unique index + race-safe insert;
  `created_at`/`status` indexes.
- 2026-10-19 — `run_dev.sh` / `backend/run.sh` pointed at an old workspace and were not executable.

### Changed
- 2026-10-19 — Inquiry form asks for a phone number when Phone/Text is the preferred
  contact method (validated client- and server-side; included in staff email).
- 2026-10-19 — Backend startup/shutdown use FastAPI `lifespan` (Starlette 1.x).
- 2026-10-19 — CI runs all backend unit tests, not only the live API suite.

### Removed
- 2026-10-19 — `@emergentbase/visual-edits` dev dependency (third-party CDN tarball).
- 2026-10-19 — Tracked `backend/__pycache__` files.

### Added
- 2026-10-19 — `docs/OWNER_CONFIRMATIONS.md` (business facts awaiting owner approval, with
  proposed neutral wording — not published); frontend hosting evaluation
  (PRODUCTION_READINESS §7).
- 2026-10-19 — Production-preparation audit documentation: `PROJECT_OVERVIEW.md`,
  `PRODUCTION_READINESS.md`, `DEVELOPMENT_ROADMAP.md`, `DEVELOPMENT_HANDOFF.md`,
  `CHANGELOG.md`. Documentation only; no application code, configuration,
  infrastructure, or data changed.

## Prior history (summarised from git)

- 2026-08-29 — Automatic GitHub Pages deployment from `main` (`deploy-gh-pages.yml`).
- 2026-08-28 — Tour CTAs routed to a dedicated TourModal → Google Calendar appointment
  schedule; placeholder phone numbers removed; canonical `hello@tinyexplorersbda.com`
  email and `WEBSITE_URL`/`REACT_APP_WEBSITE_URL` configuration; MongoDB placeholder
  detection and fail-closed production behaviour (503 instead of silent in-memory
  writes); submission timestamps in staff emails; Cloud Run API URL for preview.
- 2026-08-27/28 — Newsletter: inline form states, accessibility, server-side Google
  Workspace group sync with keyless auth, admin sync/unsubscribe endpoints.
- 2026-07-24 → 08-03 — Parent policy pages and PDF downloads, production polish and
  accessibility fixes, router basename for GitHub Pages subpath, temporary preview deploys.
- 2026-07-06 — Initial commit: Tiny Explorers production release (migrated from earlier
  repositories).
