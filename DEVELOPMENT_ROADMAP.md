# Tiny Explorers — Development Roadmap

_Created 2026-10-19 from the production-readiness audit. Finding IDs (C1, H2, …) refer to
PRODUCTION_READINESS.md. Nothing here is approved until the owner signs off;
milestones that change behaviour, infrastructure, or data require explicit approval._

Effort scale: **XS** < 1 h · **S** ≤ ½ day · **M** 1–2 days · **L** 3–5 days · **XL** > 1 week.

## Milestone 0 — Owner actions (no code; can start immediately)

| Task | Finding | Owner | Effort |
|---|---|---|---|
| Rotate Atlas DB user password; update Cloud Run `MONGO_URL` | C1 | Owner (Atlas + GCP access) | XS |
| Confirm correct address(es), phone policy, hours, opening date | C2, H9 | Owner | XS |
| Review/approve factual claims list | C4 | Owner | S |
| Decide on photography (real photos vs. approved stock) | C4 | Owner | S–L (shoot) |
| Approve privacy-policy newsletter section | C5 | Owner (+ legal if needed) | S |
| Confirm Atlas tier/backups; who receives alerts | H6 | Owner | XS |
| Decide frontend host for the real domain | M1 | Owner (recommendation in PRODUCTION_READINESS §6) | XS |

## Milestone 1 — Safe hardening (recommended first development milestone)

Small, low-risk changes, each its own commit, all on a feature branch with CI green.
No visual redesign, no infrastructure changes.

| # | Task | Finding | Effort | Risk |
|---|---|---|---|---|
| 1.1 | Replace realistic Atlas URI in test with an obvious fake (after C1 rotation) | C1 | XS | None |
| 1.2 | Fix mobile clipping in `Environment.jsx` (grid track / `min-w-0`) | H1 | XS | Low — verify at 360/390/768/1440 |
| 1.3 | Remove `@emergentbase/visual-edits` from `package.json` + lockfile | H5 | XS | Low |
| 1.4 | Run Resend calls via `asyncio.to_thread` (or `run_in_threadpool`) | H2 | S | Low — existing resilience tests cover it |
| 1.5 | Upgrade `python-multipart`, `cryptography`; drop `python-jose`/`passlib`/`PyJWT`/`bcrypt` | H4 | S | Low — run full backend suite |
| 1.6 | Upgrade `axios`, `react-router-dom` (minor versions) | H4 | S | Low |
| 1.7 | Create Mongo indexes on startup (unique `newsletter.email`, `created_at` on all) | H8 | S | Low–Med (unique index fails if duplicates already exist — check first) |
| 1.8 | Trust Cloud Run proxy headers (`--proxy-headers --forwarded-allow-ips`) and key limiter on client IP | H3 | S | Med — verify on staging revision |
| 1.9 | Inquiry form: conditional phone field when "Phone" selected (backend `phone` optional field) | H7 | S | Low |
| 1.10 | Run all backend tests in CI; fix `run_dev.sh`/`run.sh` paths; untrack `__pycache__` | L, M6 | XS | None |
| 1.11 | Apply owner-approved content corrections (address, dates) | C2, H9 | XS | None |

**Milestone total: ~3–4 days.** Dependencies: 1.1 after C1 rotation; 1.11 after owner input.

## Milestone 2 — Launch readiness (domain cutover)

| # | Task | Finding | Effort | Depends on |
|---|---|---|---|---|
| 2.1 | Choose/configure frontend host for `tinyexplorersbda.com` (+ `www` redirect, HTTPS) | C3, M1 | S | M0 host decision |
| 2.2 | Make base path environment-driven: `homepage`/`PUBLIC_URL`, 404 strategy, robots/sitemap generated at build | C3 | M | 2.1 |
| 2.3 | Update deploy workflow assertions; keep GitHub Pages as preview with `noindex` (or retire) | C3 | S | 2.2 |
| 2.4 | Backend env: `WEBSITE_URL`, `CORS_ORIGINS` (apex + www), fresh `ADMIN_API_KEY` in Secret Manager | C3 | XS | 2.1 |
| 2.5 | Security headers (CSP, HSTS, etc.) on the new host | M1 | S | 2.1 |
| 2.6 | Monitoring: uptime checks, Cloud Run alert policy, optional Sentry | H6 | S | — |
| 2.7 | End-to-end verification on the deployed stack (DB record + 2 emails per form, SPF/DKIM/DMARC) | — | S | 2.4 |
| 2.8 | Lighthouse/axe pass + cross-browser smoke test; fix findings | M11 | M | 2.1 |
| 2.9 | Merge privacy update; add unsubscribe link/flow for newsletter | C5, M9 | M | Owner approval |
| 2.10 | Real photography swapped into `content.js` (self-hosted, optimised WebP/AVIF) | C4 | M | Photos supplied |
| 2.11 | Rollback runbook + branch protection on `main` | — | XS | — |

**Milestone total: ~1.5–2 weeks** of development, gated on owner inputs.

## Milestone 3 — Post-launch improvements (optional)

| Task | Effort | Notes |
|---|---|---|
| Lightweight admin view for submissions (or evaluate the private `tinyexplorers-admin` repo) | L | Today staff rely on emails + `X-Admin-Key` API |
| Migrate CRA → Vite | M–L | Removes ~96 build-tool advisories; keep React/Tailwind/components |
| Pre-render routes for social previews (e.g. `react-snap`/Vite SSG) or Next.js | L–XL | Only if SEO/social sharing is a priority |
| `FastAPI` lifespan, non-root Docker user, healthcheck, newer FastAPI/Uvicorn | S | |
| Prune unused shadcn components and npm deps | S | |
| Testimonials carousel, gallery lightbox (from README backlog) | M | Needs real content first |
| Scheduled newsletter sync job (Cloud Scheduler → `/api/admin/newsletter/sync`) | S | Once Workspace auth verified |
| Portuguese localisation (PRD backlog) | XL | Business decision |

## Task dependency overview

```
C1 rotate ──► 1.1
Owner content (C2/C4/H9) ──► 1.11 ──► 2.10
Host decision ──► 2.1 ──► 2.2 ──► 2.3
                     └──► 2.4 ──► 2.7
                     └──► 2.5, 2.8
Privacy approval ──► 2.9
Milestone 1 (independent items) can proceed in parallel with Milestone 0.
```
