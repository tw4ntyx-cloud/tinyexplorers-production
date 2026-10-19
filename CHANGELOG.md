# Changelog

All notable changes to this project are recorded here. Dates are UTC.
History before this file existed is summarised from `git log`.

## [Unreleased]

### Added
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
