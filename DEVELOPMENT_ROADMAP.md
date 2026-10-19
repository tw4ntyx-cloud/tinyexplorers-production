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

## Milestone 1 — Safe hardening ✅ complete on branch (2026-10-19), awaiting review/merge

| # | Task | Finding | Status |
|---|---|---|---|
| 1.1 | Replace realistic Atlas URI in test with synthetic values; document exposure + rotation steps | C1 | ✅ Done (rotation itself = owner, M0) |
| 1.2 | Fix mobile clipping in `Environment.jsx` | H1 | ✅ Done, browser-verified |
| 1.3 | Remove `@emergentbase/visual-edits` | H5 | ✅ Done |
| 1.4 | Email off the event loop with bounded wait; mask emails in logs | H2 | ✅ Done |
| 1.5 | Backend dependency upgrades (FastAPI/Starlette, PyMongo/Motor, crypto, etc.); drop unused auth libs; lifespan | H4, M5 | ✅ Done — `pip-audit` clean |
| 1.6 | Frontend runtime deps | H4 | ✅ axios 1.20.0; react-router v7 deferred (advisories not reachable) |
| 1.7 | Mongo indexes incl. unique `newsletter.email`, race-safe insert | H8 | ✅ Done — check prod for duplicate emails before deploy |
| 1.8 | Trusted-proxy-aware rate-limit key (`TRUSTED_PROXY_HOPS`) | H3 | ✅ Code done — needs env var + verification on Cloud Run (M2) |
| 1.9 | Inquiry phone field (client + server validation) | H7 | ✅ Done |
| 1.10 | Dev scripts, CI runs all backend tests, untrack `__pycache__` | M6, L | ✅ Done |
| 1.11 | Owner-approved content corrections | C2, C4, H9 | ⏳ Blocked on `docs/OWNER_CONFIRMATIONS.md` answers |

Tests at completion: frontend 20/20, backend unit 76/76, live API 22/22, production build + Pages artifact checks pass.

## Milestone 2 — Launch readiness (domain cutover)

**Preparation status (2026-10-19, nothing deployed or merged):**
- ✅ Credential-rotation runbook with confirmation gates: `docs/security/2026-10-mongodb-credential-exposure.md`. Owner to run Step 1.
- ✅ Deployment behaviour documented: `docs/deployment/DEPLOYMENT_BEHAVIOR.md`. **Merging to `main` auto-deploys the backend at 100% traffic** via a Cloud Build trigger.
- ✅ Zero-traffic staging plan, verification tests and rollback: `docs/deployment/cloud-run-staging-plan.md`, plus `docs/deployment/smoke-test.sh`.
- ✅ Owner questionnaire: `docs/OWNER_QUESTIONNAIRE.md`.
- ✅ Admin dashboard evaluation: `docs/ADMIN_DASHBOARD_EVALUATION.md`. Recommendation: not a launch blocker; add the option-B safety net before launch.
- ✅ Visual and usability review: `docs/VISUAL_REVIEW_2026-10.md` (V1–V11, not applied).
- ✅ Working local preview and one-click Codespaces safe preview (`.devcontainer/`).
- ✅ Blockers split into "development can do now" and "needs the owner": `PRODUCTION_READINESS.md` §8.


| # | Task | Finding | Effort | Depends on |
|---|---|---|---|---|
| 2.0 | Deploy Milestone 1 backend to a Cloud Run **revision with no traffic**, set `TRUSTED_PROXY_HOPS=1`, check duplicate newsletter emails, verify, then shift traffic | H3, H8 | S | Owner approval, C1 rotation |
| 2.0a | Decide the Cloud Build trigger policy (keep auto-100% with staging-first discipline, or add `--no-traffic`) | — | XS | Owner |
| 2.0c | Admin safety net (daily digest + CSV export) | admin | ~1 d | Approval |
| 2.0d | Approved visual quick wins (V5, V6, V8, V9) | V-items | XS–S | Owner approval |
| 2.0b | Apply approved content wording (A1–A4, B1–B15) and photography decision | C2, C4 | S–M | Owner answers |
| 2.1 | Configure frontend host for `tinyexplorersbda.com` (recommended Cloudflare Pages; + `www` redirect, HTTPS) | C3, M1 | S | M0 host decision |
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
| Admin dashboard (the private `tinyexplorers-admin` repo is an **empty placeholder** — build new): server-side admin auth (e.g. Google sign-in allowlist), pagination/filters, status + notes, CSV export, delete/anonymise for privacy requests, audit log | L (read-only 2–4 d; workflow +2–3 d) | Never put `ADMIN_API_KEY` in browser code |
| react-router v7 upgrade (clears remaining runtime advisories) | M | Pair with Vite migration |
| Docker hardening: non-root user, `HEALTHCHECK` | XS | |
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
