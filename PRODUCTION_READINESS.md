# Tiny Explorers — Production Readiness

_Audit date: 2026-10-19 · Audited commit: `main` @ `ac777b1` · Auditor: Claude Code session_

Evidence labels used below:

- **Confirmed**: reproduced in a browser or test, or plainly visible in code.
- **Suspected**: plausible from the code or config, but not reproduced.
- **Unverified**: depends on systems this audit could not reach.

## 0. Remediation status (updated 2026-10-19, Milestone 1, branch `claude/trusting-ramanujan-v9r2or`, not yet merged or deployed)

| ID | Status | Notes |
|---|---|---|
| C1 | **CRITICAL, OUTSTANDING: blocked on Atlas access** | Fixture replaced with synthetic values (repo side done). Cloud Run checks done by the owner (rollback revision `…-00021-9s9`, `MONGO_URL` = secret `mongo_url:latest`). **The owner cannot sign in to Atlas**, so the credential cannot be rotated yet. Recovery steps: `docs/security/atlas-access-recovery.md`. Runbook updated to use a separate secret `mongo_url_2026_10:1`; **never add versions to `mongo_url`**, because live instances read `latest`. |
| C2, C4, H9 | **Mostly resolved on branch (2026-10-19)** | Questionnaire answers applied (address, campus, dates, ratios, staff, nurse, facility, food, photo wording). Guard test added. Round-2 questions open: Ministry registration, "Est. 2026", drills, languages and more (`docs/OWNER_CONFIRMATIONS.md`). |
| C5 | **Partly resolved** | Newsletter section merged into the site policy. **Privacy PDF and DOCX regenerated (v1.1)** from the website text with `frontend/scripts/policy-docs/` (24/24 blocks verified). Still open: v1.1 sign-off and effective date, privacy contact, PIPA review, 6-month retention wording (job not to be built yet). Questions in `docs/OWNER_QUESTIONNAIRE_ROUND2.md`. |
| M12 (new) | **Open: decision** | The 11 other `.docx` files in `public/policies-docs/` are **incomplete stubs** (0–4 of 8–23 text blocks each). They are not linked from the site but are publicly downloadable by URL. All 12 **PDFs match the website text** (differences are layout only). Options: regenerate them from the website text with the generator, or remove them from `public/`. |
| H1 | **Fixed** | `grid-cols-1` on the Environment grid. Chromium shows no overflow at 360/390/768px on any page. |
| H2 | **Fixed** | Email runs in a worker thread with a bounded wait (`EMAIL_SEND_TIMEOUT_SECONDS`, default 10). Parent emails are masked in logs. |
| H3 | **Fixed in code; needs `TRUSTED_PROXY_HOPS=1` on Cloud Run** | The default (0) ignores `X-Forwarded-For`. Confirm on a Cloud Run revision before relying on it. |
| H4 | **Fixed (backend); mostly fixed (frontend)** | `pip-audit` is clean (FastAPI 0.146 / Starlette 1.9, PyMongo 4.19, etc.; unused auth libs removed). axios 1.20.0. The react-router v6 advisories (open redirect via `<Link>` with user-controlled URLs; SSR) are **not reachable**: all link targets are static and there is no SSR. The fix needs a v7 upgrade, which is deferred. The remaining npm advisories are CRA build tooling. |
| H5 | **Fixed** | Emergent dependency removed; `npm ci` uses the public registry only. |
| H7 | **Fixed** | Inquiry form requires a phone number for Phone/Text contact (client and server). |
| H8 | **Fixed** | Unique `newsletter.email` index plus `created_at`/`status` indexes created at startup, and race-safe insert. Admin list cap (500) is unchanged. **Before deploy:** check production for existing duplicate emails, otherwise the unique index is skipped (logged) until they are removed. |
| M5 | **Partly fixed** | Moved to FastAPI `lifespan`. Docker non-root user and healthcheck are still open. |
| M6 | **Fixed** | `run_dev.sh` and `backend/run.sh` repaired and executable; `__pycache__` untracked. |
| CI gap (Low) | **Fixed** | CI now runs all backend unit tests plus the live API tests. |

## 1. What was actually verified

| Check | Result |
|---|---|
| Frontend unit tests (`craco test`) | **16/16 pass** (3 suites) |
| Frontend production build | **Succeeds**; 173.6 kB JS + 15.4 kB CSS (gzip) |
| Backend unit tests (mongo, email, workspace, URL validation) | **56/56 pass** |
| Backend API tests against a running server (`tests/test_api.py`) | **22/22 pass** |
| Browser: all 9 routes + 2 policy pages + 404, at 1440px and 390px | Load. Each page has one `<h1>`, a per-page title and a canonical URL. No unnamed buttons or links, no missing `alt`, no `href="#"` |
| Browser: in-page anchors (`#programs`, `#gallery`, `#careers`, `#faq`, …) | All targets exist |
| Browser: newsletter, admissions and inquiry forms submitted to a local API | **201 responses**; success states render; modals close on Esc |
| Browser: 404 page | Renders with `noindex` |
| Policy PDF download | 200, `application/pdf` |
| Live sites (GitHub Pages, Cloud Run, final domain) | **Not reachable from the audit sandbox** (egress blocked). Status comes from GitHub only: the Pages deploy succeeded on 2026-08-29 and CI is green |

The sandbox could not load any external images (Unsplash/Pexels), Google Fonts, Resend, Atlas or Google Workspace. Visual review of imagery and real email and database behaviour therefore remains **unverified**.

## 2. Findings

### Critical: must resolve before production

| ID | Finding | Evidence | Label |
|---|---|---|---|
| C1 | **Possible database credential in a public repo.** The repository is **public**. `backend/tests/test_mongo_url_validation.py:75` (added in `ba4f124`) contains a full `mongodb+srv://` URI. It uses the real production Atlas hostname, a realistic username and a 16-character non-placeholder password. It may be an invented example, but that can't be confirmed from here. Treat it as exposed: **rotate that Atlas DB user's password**, then replace the literal with an obviously fake value. Rewriting history is optional and needs your approval. | Code + repo visibility | Suspected exposure |
| C2 | **Two different street addresses are shown to families.** The hero shows "59 Victoria St, Hamilton". The footer and JSON-LD show "12 Reid Street, Hamilton HM 11". | `content.js:136,164`, `Hero.jsx:52`, `Footer.jsx:139`, `index.html` | Confirmed |
| C3 | **Production domain cutover is not done, and parts of it are not config-only.** All of the following still target the GitHub Pages subpath: `package.json` `homepage`, `public/404.html` (`segmentCount = 1`), the inline redirect script in `index.html`, `robots.txt`, `sitemap.xml`, `.env.production` `REACT_APP_WEBSITE_URL`, and backend `WEBSITE_URL` / `CORS_ORIGINS`. `deploy-gh-pages.yml` asserts the `/tinyexplorers-production/` paths and the Cloud Run URL, so it will fail after the change. | Code | Confirmed |
| C4 | **Factual claims need owner sign-off.** For a childcare provider these are trust and regulatory statements: "Keycard entry", "Certified early-years teachers", "1:4 industry-leading ratio", "4,200 square feet", "Hamilton & Paget campuses", "Our Hamilton campus was co-designed with … a pediatric architect", opening hours, and ages and ratios per program. All photography is hotlinked **stock** (15 Unsplash/Pexels URLs) presented as the school's own spaces. | `content.js` | Unverified |
| C5 | **The privacy policy does not yet cover the newsletter or online form data** (family names, emails, child names and ages, free-text needs). The draft is unmerged and has 4 open questions. | `docs/newsletter-privacy-update.md` | Confirmed (docs) |

### High: important operational or functional problems

| ID | Finding | Evidence | Label |
|---|---|---|---|
| H1 | **Homepage "Our Environment" text is clipped on phones.** At 360px and 390px the heading, paragraph and list extend to x≈504px and are cut off by `main { overflow:hidden }`. The likely cause is an implicit grid track in `Environment.jsx:40` (`grid` with no `grid-cols-1` / `min-w-0`). | Browser measurement + screenshot | Confirmed |
| H2 | **Email sending blocks the server.** The `async` wrappers in `email_service.py:317+` call the synchronous Resend SDK directly. Each submission blocks the event loop for up to 2 network round-trips, so every concurrent request stalls. | Code | Confirmed (code) |
| H3 | **Rate limiting probably applies one shared limit to all users on Cloud Run.** `slowapi` keys on `request.client.host`. Uvicorn only honours `X-Forwarded-For` from `127.0.0.1` by default, so behind Cloud Run's front end every visitor may share one bucket (5 enrollments/min site-wide). The limit is also in-memory per instance. | Code | Suspected |
| H4 | **Vulnerable dependencies.** Backend: `python-multipart 0.0.20` (6 advisories), `cryptography 48.0.0` (4), `ecdsa 0.19.2` (via the unused `python-jose`). Frontend runtime: `axios` (high), `react-router` (moderate). The 96 other npm advisories are CRA build/dev-server tooling and are not shipped to browsers. | `pip-audit`, `npm audit` | Confirmed |
| H5 | **The build depends on a third-party tarball.** `@emergentbase/visual-edits` is fetched from `assets.emergent.sh`, a leftover from the original Emergent build. It returned **403** in the audit environment, so `npm ci` fails there. CI and Pages deploys break if that URL disappears. It is optional at runtime (`craco.config.js` already tolerates its absence). | Install log | Confirmed |
| H6 | **No backup, monitoring or alerting is documented.** The Atlas tier, backup schedule, point-in-time recovery, uptime checks, error tracking and log retention are unknown. Submissions (family PII) live only in Atlas plus notification emails. | Repo | Unverified |
| H7 | **Inquiry form offers "Phone" as a contact method but has no phone field.** Staff cannot call a family who selects it. | `InquiryModal.jsx`; payload observed in browser | Confirmed |
| H8 | **No unique index on `newsletter.email`.** No indexes are created anywhere. Concurrent duplicate signups can create duplicate records. Admin list endpoints are hard-capped at 500 rows with no pagination. | `server.py` | Confirmed (code) |
| H9 | **Opening and enrollment copy may be stale.** "Now enrolling · Fall 2026", "Opening Fall 2026" and "We open our doors Fall 2026" were written before the date of this audit (Oct 2026). | `content.js`, `CtaSection.jsx`, `Testimonial.jsx` | Needs owner input |

### Medium: quality and usability

| ID | Finding | Label |
|---|---|---|
| M1 | Several deploy targets coexist: GitHub Pages (active), `frontend/vercel.json`, `render.yaml`, and Cloud Run (documented, no IaC in repo). Pick one per tier and archive the rest. Note that `vercel.json`'s CSP (`script-src 'self'`) would block the inline Pages redirect script in `index.html`. | Confirmed |
| M2 | Create React App is deprecated and `react-scripts 5` is frozen. Long-term maintenance and security fixes will get harder. Migrating to Vite is the low-risk path; Next.js gives SSR/SEO but is a larger change. | Confirmed |
| M3 | The SPA renders metadata client-side. Google renders JS, but social link previews (Facebook, WhatsApp, iMessage) see only the static `index.html` "Home" title and the stock OG image for every page. | Confirmed (code) |
| M4 | Scroll-triggered fade-in hides sections until scrolled into view. This is fine for users, but full-page captures and some crawlers see blank space. Reduced-motion is respected. | Confirmed |
| M5 | FastAPI `@app.on_event` is deprecated; switch to `lifespan`. `Dockerfile` runs as root with a single worker and no `HEALTHCHECK`. | Confirmed |
| M6 | `run_dev.sh` and `backend/run.sh` hard-code `/workspaces/tinyexplorersv3/...` and do not work in this repo. `backend/__pycache__/*.pyc` is committed. | Confirmed |
| M7 | Production source maps are published (`main.*.js.map`). These are low risk because the code is public anyway. | Confirmed |
| M8 | Editable `.docx` originals and PDFs of all policies are published under `/policies-docs/` (~15 MB) and duplicated in `docs/policies/`. Confirm the DOCX files are meant to be public. | Confirmed |
| M9 | There is no public newsletter unsubscribe; only an admin endpoint exists. Welcome emails should carry an unsubscribe route before regular sends begin. | Confirmed |
| M10 | Root docs from June 2026 contradict the code (hosting, auth, domains `tinyexplorers.bm`). They are now labelled historical in PROJECT_OVERVIEW.md. | Confirmed |
| M11 | No Lighthouse/axe run was possible (fonts and images were blocked). Colour contrast of `text-brand-ink/65` body copy and the orange-on-cream accents should be checked. | Unverified |

### Low: optional

- Remove unused backend deps (`python-jose`, `passlib`, `PyJWT`, `bcrypt`), which shrinks the attack surface and resolves the `ecdsa` advisory.
- Remove ~40 unused shadcn/ui components and unused npm deps (`recharts`, `cmdk`, `input-otp`, `react-day-picker`, `vaul`, `next-themes`, …) to cut install size.
- Add `X-Robots-Tag: noindex` to the GitHub Pages preview so it does not compete with the real domain once live.
- Newsletter returns "already subscribed", which lets someone check whether an email is subscribed. Acceptable for a newsletter; note it in the privacy review.
- Add a backend test job for the non-`test_api` suites to CI. CI currently runs only `tests/test_api.py`; the other 56 tests run only locally.

## 3. Security summary

| Area | State |
|---|---|
| Secrets in code/history | No API keys or private keys found by pattern scan. **One possible Atlas password (C1).** `.env` files are git-ignored; `.env.example` files are safe. |
| Secrets in frontend bundle | None. Only `REACT_APP_*` public values (API URL, calendar URL, site URL) are present. |
| AuthN/AuthZ | No user accounts. Admin endpoints use a shared `X-Admin-Key` with constant-time compare. They fail closed when unset. The key is a single static secret with no rotation or audit trail. |
| Input validation | Pydantic models with length limits on all public POSTs. User content is HTML-escaped in emails. |
| CORS | Explicit allow-list from env; credentials off. Must include both the apex and `www` origins at cutover. |
| Rate limiting | Present (5–10/min) but see H3. |
| Security headers | API: nosniff, X-Frame-Options DENY, Referrer-Policy, HSTS in production. GitHub Pages cannot set headers, so the site has **no CSP/HSTS** until it moves to a host that can. |
| Logging | MONGO_URL is never logged. Email addresses *are* logged when email is disabled (`Would send to …`), which is PII in logs. |

## 4. Deployment requirements

**Frontend build-time variables:** `REACT_APP_BACKEND_URL`, `REACT_APP_WEBSITE_URL`, `REACT_APP_TOUR_BOOKING_URL`; also `PUBLIC_URL`/`homepage` for the base path.

**Backend runtime variables:** `ENVIRONMENT=production`, `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `CORS_ALLOW_CREDENTIALS=false`, `ADMIN_API_KEY`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL`, `WEBSITE_URL`, `LOG_LEVEL`. Optional, for Google Workspace: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_WORKSPACE_ADMIN_EMAIL`, `GOOGLE_NEWSLETTER_GROUP_EMAIL`. See `backend/.env.example` and `docs/google-workspace-newsletter.md`.

**External accounts:** GitHub, Google Cloud (Cloud Run project), MongoDB Atlas, Resend (domain `tinyexplorersbda.com` reported as verified), Google Workspace, and the DNS registrar for `tinyexplorersbda.com`.

## 5. Production launch checklist

**Content and legal**
- [ ] C2: owner confirms the single correct street address (or addresses for two campuses).
- [ ] C4: owner verifies every factual claim (ratios, square footage, certifications, security, campuses, hours, ages, opening date).
- [ ] C4: replace stock imagery with real, consented photography (or explicitly approve stock usage and remove "our campus" framing).
- [ ] C5: approve and merge the privacy-policy update; add a data-retention statement for form submissions.
- [ ] H9: update the opening and enrollment season copy.
- [ ] Confirm a phone number, or confirm email-only contact, for launch.

**Security**
- [ ] C1: rotate the Atlas DB user password; replace the test literal; restrict Atlas network access to Cloud Run egress if feasible.
- [ ] H4: upgrade `python-multipart`, `cryptography`, `axios`, `react-router-dom`; drop unused auth libs.
- [ ] H5: remove the `@emergentbase/visual-edits` dependency.
- [ ] Generate a fresh `ADMIN_API_KEY` for launch and store it only in Secret Manager.
- [ ] Choose a frontend host that supports security headers (CSP, HSTS), or accept GitHub Pages' limits.

**Functionality**
- [ ] H1: fix the mobile clipping in the Environment section.
- [ ] H7: add a phone field when "Phone" is chosen, or remove the option.
- [ ] H2: move Resend calls off the event loop.
- [ ] H3: configure trusted proxy headers on Cloud Run and verify per-client limiting.
- [ ] H8: create a unique index on `newsletter.email` and indexes on `created_at`.
- [ ] End-to-end test on the **deployed** stack: each form produces one DB record, a staff email to `hello@` and a parent confirmation. Check spam placement and SPF/DKIM/DMARC.

**Infrastructure and operations**
- [ ] C3: domain cutover (DNS, HTTPS, base path, 404 strategy, robots/sitemap, env vars, CORS, deploy-workflow assertions).
- [ ] H6: confirm the Atlas backup tier and do one test restore; set up an uptime check on `/api/health` and the site; set up error alerting (Cloud Run log-based alert or Sentry).
- [ ] Document rollback: Cloud Run revision rollback, plus re-running the Pages deploy for a previous commit.
- [ ] Protect `main` with required CI checks.

**Quality**
- [ ] Lighthouse and axe pass on the real domain (performance, accessibility, SEO).
- [ ] Cross-browser smoke test: Safari iOS, Chrome Android, desktop Safari/Chrome/Firefox/Edge.
- [ ] Submit the sitemap to Google Search Console; set up a Google Business Profile with the confirmed address.

## 6. Recommended production architecture

Keep the current architecture. It suits a small marketing and admissions site, and migrating would add risk without clear benefit.

| Concern | Recommendation | Why |
|---|---|---|
| API hosting | **Keep Google Cloud Run** (min instances 0–1, max ~3). | Already deployed. It is the only host that supports keyless Google Workspace auth without extra setup (README, `docs/google-workspace-newsletter.md`). Near-zero cost at this traffic. Revision-based rollback. Railway would work for the API itself but loses keyless Workspace auth, so it brings no benefit here. Render (`render.yaml`) has the same issue. |
| Frontend hosting | **Recommended: Cloudflare Pages** for the production domain. Keep GitHub Pages as the preview until cutover. See §7. | Free for commercial use. Proper SPA fallback (HTTP 200). Security headers. Preview deploys. Works with a private repo. |
| Database | Keep MongoDB Atlas. Confirm the tier has backups (M10+ for continuous backup; on M0/Flex, schedule `mongodump` exports). | Low volume; the data model is simple. |
| Email | Keep Resend with the verified domain; add DMARC. | Already integrated and tested. |
| Monitoring | Cloud Run built-in logs and metrics, an uptime check and an alert policy; optional Sentry for frontend JS errors. | Little to set up, low cost. |
| Secrets | Google Secret Manager mounted into Cloud Run. | Avoids plain env values in the console. |
| Framework | No migration before launch. After launch, consider CRA → Vite (days of work, low risk). Next.js only if SEO or social previews become a business priority. | Stability first. |

Estimated running cost: Cloud Run ~$0–5/mo, Atlas $0 (M0) to ~$57/mo (M10 with backups), Resend free–$20/mo, static hosting $0, plus the domain.

## 7. Frontend hosting evaluation (for the eventual production domain)

The frontend is a static React SPA (~190 kB gzipped JS+CSS, plus ~15 MB of policy PDFs/DOCX). Any static host works. The deciding factors are:
- SPA deep-link handling;
- HTTP security headers;
- commercial-use terms;
- whether the repository can be made private;
- maintenance effort.

Pricing and limits change often. Re-check each provider's current plan page before committing.

| Criterion | GitHub Pages (current preview) | **Cloudflare Pages** | Netlify | Vercel |
|---|---|---|---|---|
| Cost for this site | Free (public repo). Private repo requires a paid GitHub plan. | Free tier: generous builds, unlimited static bandwidth | Free tier with usage limits; paid above them | **Hobby plan is non-commercial only**, so a business site needs Pro (per-seat monthly fee) |
| Commercial use on free tier | Allowed, but not intended for commercial "online business" use; acceptable for a brochure site | Yes | Yes | No |
| SPA deep links (`/philosophy`) | **`404.html` redirect hack: deep links are first served with HTTP 404**, which hurts indexing of every page except `/` | `_redirects`: `/* /index.html 200` | `_redirects`: `/* /index.html 200` | `vercel.json` rewrites (already in repo) |
| Security headers (CSP, HSTS, frame-ancestors) | **Not configurable** | `_headers` file | `_headers` / `netlify.toml` | `vercel.json` (already drafted) |
| HTTPS + custom apex domain | Yes (Let's Encrypt); apex via A records | Yes; apex is easiest with Cloudflare DNS (nameserver move), or a CNAME for `www` | Yes; apex via their DNS or ALIAS/A records | Yes |
| Preview deploy per branch/PR | No (single site) | Yes | Yes | Yes |
| Private repository | Paid plan needed | Yes | Yes | Yes |
| Build compatibility (CRA, Node 20) | Already working via Actions | Yes (or deploy the Actions-built folder with `wrangler`) | Yes | Yes |
| Extras | none | Free DDoS/CDN, privacy-friendly Web Analytics | Form handling, split testing | Analytics, edge functions |
| Migration effort from today | none | Small: base path `/`, `_headers`, `_redirects`, DNS | Small (same as Cloudflare) | Small (config exists) but adds a paid seat |
| Lock-in | Low | Low | Low | Low |

**Recommendation:** Cloudflare Pages.
- It is free for commercial use and serves deep links with HTTP 200, which fixes the SEO problem above.
- It supports real CSP/HSTS headers and per-PR previews.
- It lets the repository be made private (see C1).
- Netlify is a close second.
- Vercel is technically fine, but adds a recurring seat cost for a commercial site.
- GitHub Pages is acceptable as a preview, but not recommended for production because of the 404-status deep links and the lack of headers.

Cutover is roadmap Milestone 2 and needs owner approval: DNS changes and connecting the domain.

## 8. Blockers and items resolvable without the nursery owner (reviewed 2026-10-19)

### Can be done by development now (no owner input needed; each still needs approval to merge or deploy)

| Item | Finding | Effort | Notes |
|---|---|---|---|
| Make the base path, `robots.txt`, `sitemap.xml` and `404.html` strategy build-time configurable; prepare Cloudflare Pages `_headers` (CSP/HSTS) and `_redirects` | C3, M1 | M | Prepared but **not connected**; the domain stays untouched |
| `noindex` on the GitHub Pages preview build, so the preview never competes with the real domain | L | XS | Meta tag driven by a build env var |
| Admin "option B" safety net: daily digest of new submissions; CSV export script for records and privacy requests | H6 / admin | ~1 d | See `docs/ADMIN_DASHBOARD_EVALUATION.md` |
| Public token-based newsletter unsubscribe and link in the welcome email | M9 | M | Mechanism only; the privacy wording stays with the owner |
| Docker hardening (non-root user, `HEALTHCHECK`) | M5 | XS | |
| Monitoring kit: uptime-check and alert-policy definitions and a runbook | H6 | S | Applying them in GCP needs owner clicks |
| Tap targets ≥24px, duplicate quote glyph, tour link in a new tab | V6, V8, V9 | XS | Visual and usability, needs approval (see `docs/VISUAL_REVIEW_2026-10.md`) |
| Dependabot or Renovate config for dependency update PRs | H4 | XS | |
| Image pipeline (self-hosted, WebP/AVIF, responsive sizes), ready for whichever photos are chosen | C4 | S | Independent of the photo decision |
| Per-page social previews (pre-rendered HTML per route) | M3 | M | Optional before launch |

### Additional non-destructive preparations identified (2026-10-19)

| Item | Effort | Notes |
|---|---|---|
| Regenerate the 11 stub DOCX files from the website text (or remove them) | XS | Generator ready; needs a metadata entry (doc ID, version) per policy |
| Hide the GitHub Pages preview from search engines (`noindex` build flag) | XS | The preview shows old content and real forms |
| Prepare Cloudflare Pages `_headers`/`_redirects` (not connected) | S | Lets cutover happen in hours, not days |
| Dependabot/Renovate config | XS | Dependency update PRs land on branches, never directly on `main` |
| Docker non-root user + `HEALTHCHECK` | XS | Ships with the next backend deploy |
| Enquiry digest + CSV export | ~1.5 d | Proposal: `docs/ENQUIRY_DIGEST_PROPOSAL.md` (awaiting decisions) |

### Needs the owner (cannot be resolved by development)

| Item | Finding | What is needed |
|---|---|---|
| Rotate the Atlas credential | C1 | Run the gated runbook in `docs/security/…` |
| Business facts, photos, privacy policy | C2, C4, C5, H9 | Answers to `docs/OWNER_QUESTIONNAIRE.md` |
| Approve the zero-traffic staging deploy, then the merge | H3, H8 | `docs/deployment/cloud-run-staging-plan.md` |
| Decide the Cloud Build trigger policy (auto 100% vs `--no-traffic`) | — | `docs/deployment/DEPLOYMENT_BEHAVIOR.md` |
| Atlas backup tier and alert recipients | H6 | Console access and billing decision |
| Frontend host account and DNS for `tinyexplorersbda.com` | C3 | At cutover only (not now) |
| Need for a staff dashboard before launch | — | Questionnaire Q27–28 |
