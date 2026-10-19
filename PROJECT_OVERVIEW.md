# Tiny Explorers — Project Overview

_Last updated: 2026-10-19 (production-preparation audit). Supersedes the June 2026
root-level planning docs; see "Documentation map" below._

## Purpose

Marketing and admissions website for **Tiny Explorers Nursery & Preschool**, a
Bermuda-based early-childhood center (repository evidence: `frontend/src/data/content.js`,
`frontend/public/index.html`, `memory/PRD.md`).

What the code states about the business (owner verification required before launch;
see PRODUCTION_READINESS.md §Content):

| Fact | Source | Status |
|---|---|---|
| Location: Hamilton, Bermuda ("Hamilton & Paget campuses") | `content.js` | Unverified |
| Address: **two different values** — "59 Victoria St, Hamilton" (hero) and "12 Reid Street, Hamilton HM 11" (footer + JSON-LD) | `content.js:136`, `content.js:164`, `index.html` | **Conflict** |
| Programs: Infant (6–18 mo), Toddler (18–36 mo), Preschool (3–5 y), After School (5–8 y) | `content.js` | Unverified |
| Opening: "Now enrolling · Fall 2026", "Est. 2026" | `content.js`, `CtaSection.jsx`, `Testimonial.jsx` | Possibly stale (today is Oct 2026) |
| Contact: `hello@tinyexplorersbda.com`; **no phone number** (deliberately removed until verified) | `content.js:161` | Email domain verified in Resend per commit `b7a05ac` |
| Hours: Mon–Fri 07:30–18:00 | `index.html` JSON-LD | Unverified |
| Legal entity: "Tiny Explorers Bermuda Ltd." | `docs/newsletter-privacy-update.md` (draft) | Unverified |

## Architecture

```
 Browser ──► Static SPA (React, CRA) ──HTTPS/JSON──► FastAPI API ──► MongoDB Atlas
              GitHub Pages (preview)                  Google Cloud Run     (Atlas cluster)  
                                                         │
                                                         ├─► Resend (transactional email)
                                                         └─► Google Workspace Admin SDK
                                                              (newsletter@ group membership)
 Book-a-tour CTAs ──► Google Calendar appointment schedule (external link, no API)
```

- **Frontend** (`frontend/`): React 18.2 on Create React App 5 via CRACO, Tailwind 3.4,
  shadcn/ui (Radix), react-router 6, react-helmet-async, axios, sonner. Single-page app;
  per-route `<title>`/meta/canonical via Helmet (`components/PageMeta.jsx`).
  Copy and image URLs are centralised in `src/data/content.js`; parent policies in
  `src/data/policies.js` with downloadable PDFs/DOCX in `public/policies-docs/`.
- **Backend** (`backend/`): FastAPI 0.110 + Motor (async MongoDB), Pydantic v2,
  slowapi rate limiting, Resend email, Google Workspace Admin SDK (keyless DWD
  auth on Cloud Run). Dockerised (`backend/Dockerfile`).
- **Data**: MongoDB collections `newsletter`, `enrollment`, `inquiry`, `admissions`.
  No schema migrations, no indexes created by the app. In development an in-memory
  fallback is used when `MONGO_URL` is empty; in production the API refuses to start
  without a real `MONGO_URL` and returns 503 if Atlas is unreachable.

## Main features (verified locally 2026-10-19 unless noted)

| Feature | Endpoint / component | Verified |
|---|---|---|
| 8 public routes + policy pages + 404 | `App.js` | Browser (desktop 1440, mobile 390) |
| Newsletter signup (footer) | `POST /api/newsletter` | Browser → 201, stored |
| Admissions multi-step modal ("Start Enrollment") | `POST /api/admissions` | Browser → 201, success state |
| General inquiry modal | `POST /api/inquiry` | Browser → 201, success state |
| Program enrollment modal (Programs/Adventures/Footer CTAs) | `POST /api/enrollment` | API tests only |
| Tour booking modal → Google Calendar link | `TourModal.jsx` | Modal opens; external link not followed |
| Parent policies (12) with PDF downloads | `/policies/:slug` | Browser; PDF served 200 |
| Staff email notifications + parent confirmations | `email_service.py` (Resend) | Unit tests with mocks only |
| Newsletter → Google Group sync, admin retry/unsubscribe | `google_workspace.py`, `/api/admin/newsletter/*` | Unit tests with mocks only |
| Admin read access to submissions | `GET /api/{newsletter,enrollment,inquiry,admissions}` with `X-Admin-Key` | API tests (401 without key) |

There is **no admin UI** in this repository and **no end-user authentication**.

## Technology stack summary

| Layer | Technology | Version |
|---|---|---|
| UI | React / react-dom | 18.2 |
| Build | react-scripts (CRA) + @craco/craco | 5.0.1 / 7.1 |
| Styling | Tailwind CSS, shadcn/ui (Radix) | 3.4 |
| API | FastAPI / Starlette / Uvicorn | 0.110.1 / 0.37.2 / 0.25.0 |
| DB driver | Motor / PyMongo | 3.3.1 / 4.5.0 |
| Email | Resend SDK | 2.10.0 |
| Runtime | Node 20 (CI), Python 3.11 (Docker/CI) | — |
| CI/CD | GitHub Actions (`ci.yml`, `deploy-gh-pages.yml`) | — |

## Current development status

- `main` @ `ac777b1` (2026-08-29) is the latest work; CI green; GitHub Pages preview
  auto-deploys from `main` to the `gh-pages` branch.
- Backend is reported (commit messages) as deployed on Google Cloud Run with Resend
  and Atlas configured; not directly verifiable from the audit sandbox.
- Final domain `tinyexplorersbda.com` is **not yet connected**; the site is a preview.
- See PRODUCTION_READINESS.md for blockers and DEVELOPMENT_ROADMAP.md for next steps.

## Related repositories (same owner, not inspected)

| Repo | Visibility | Last push | Likely role (inferred from names/paths) |
|---|---|---|---|
| `tinyexplorers-production` (this) | **public** | 2026-08-29 | Authoritative current source |
| `tinyexplorers-admin` | private | 2026-07-21 | Possibly an admin dashboard — unknown |
| `tinyexplorersv3` | private | 2026-07-06 | Predecessor; `run_dev.sh` still points at `/workspaces/tinyexplorersv3`; Vercel preview `tinyexplorersv3.vercel.app` audited in `docs/production-audit.md` |
| `tinyexplorersv4-wp` | private | 2026-05-15 | WordPress attempt — unknown |
| `tinyexplorers` | private | 2026-05-13 | Earliest version — unknown |

## Documentation map

| Document | Status |
|---|---|
| `PROJECT_OVERVIEW.md`, `PRODUCTION_READINESS.md`, `DEVELOPMENT_ROADMAP.md`, `DEVELOPMENT_HANDOFF.md`, `CHANGELOG.md` | **Current** (2026-10-19) |
| `README.md` | Mostly current (setup + env vars); its "Open backlog" is superseded by the roadmap |
| `docs/google-workspace-newsletter.md` | Current |
| `docs/newsletter-privacy-update.md` | Current draft awaiting owner approval |
| `docs/policies/*` | Source copies of parent policies |
| `ARCHITECTURE_AUDIT.md`, `IMPLEMENTATION_*.md`, `PROGRESS_DASHBOARD.md` | **Historical** (June 2026) — many statements no longer true |
| `docs/production-audit.md` | Historical; audits the old Vercel v3 site; file is actually RTF |
| `memory/PRD.md`, `design_guidelines.json`, `test_result.md`, `test_reports/` | Historical scaffolding from the original Emergent build |
