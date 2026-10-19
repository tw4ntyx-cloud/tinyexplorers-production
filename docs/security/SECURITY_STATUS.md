# Security status (end of day 2026-10-19)

_No credentials were read, displayed, rotated or changed while preparing this. Values below are masked._

## 1. Database credential exposure (C1): CRITICAL, OUTSTANDING

| Question | Finding |
|---|---|
| What is exposed? | One MongoDB connection string with the **real production cluster host**, a realistic username and an Atlas-generated-style password, committed in `ba4f124` (2026-08-28) in `backend/tests/test_mongo_url_validation.py`. The repository is **public**, so it has been publicly readable since then. |
| Still in the code? | **No.** Replaced with synthetic values in `386c65e`. It **remains in Git history** (commit `ba4f124`). |
| Any other credentials in tracked files or history? | **No.** A pattern scan of every tracked file and all history (Mongo URIs, Resend, Google, AWS and GitHub keys, private keys) found only synthetic test fixtures on made-up hosts (commits `8accc78`, `98ea9e1`, `386c65e`). The committed `.env` files contain only public values (API URL, booking link, site URL). `.env` files with secrets are git-ignored. |
| Is it the live password? | **Unknown.** It can't be tested without risk. Safe metadata check: Secret Manager → `mongo_url` → Versions → creation dates (see `atlas-access-recovery.md` §5). |
| What depends on it? | **Only the Cloud Run service `tinyexplorers-production`** (project `tiny-explorers-staff-portal`, us-east1). It reads `MONGO_URL` from Secret Manager `mongo_url:latest`. CI, Codespaces and local development use no database password (in-memory store). |
| What blocks rotation? | **Atlas sign-in.** The owner's "Sign in with GitHub" fails repeatedly. Recovery options: `docs/security/atlas-access-recovery.md`. |
| Safe rotation procedure | `docs/security/2026-10-mongodb-credential-exposure.md`, Steps 1–7. Uses a **new** secret `mongo_url_2026_10:1`, never a new version of `mongo_url` (live instances read `latest` on cold start). It is verified on a zero-traffic revision before traffic moves, and the old user is deleted last. |
| Verify afterwards | `/api/health` → `"database": "connected"` on the `rotate` tag URL, then on the live URL. One test signup appears in Atlas. Cloud Run logs are clean for 24 hours. Then retire the old user. `docs/deployment/smoke-test.sh` covers the full API check. |

## 2. Repository visibility

**Current:** public (`tw4ntyx-cloud/tinyexplorers-production`).

**Recommendation: make it private,** in this order (each step needs your approval):

1. **Decide the old preview's fate first.** On GitHub Free, **GitHub Pages stops serving private repositories**, so `tw4ntyx-cloud.github.io/tinyexplorers-production` would go offline. Options:
   - **(a)** accept that: it shows outdated content and its forms reach the live API;
   - **(b)** upgrade the account to GitHub Pro to keep Pages;
   - **(c)** move the preview to Cloudflare Pages (the recommended production host anyway).
2. **Check the deploy connection.** Cloud Build connects through a GitHub App. Confirm that installation includes this repository (GitHub → Settings → Applications → Installed GitHub Apps → Google Cloud Build → Repository access). It usually keeps working after the switch.
3. **Switch:** GitHub → repository **Settings → General → Danger Zone → Change visibility → Private**.
4. **Afterwards:**
   - CI still runs (Free private repos include Actions minutes);
   - Codespaces previews still work;
   - Claude's GitHub access is unaffected;
   - re-check one CI run and the Cloud Build check on the next `main` commit.

Making the repository private **does not** make the leaked password safe, because it may already have been copied. Rotation (C1) is still required.

**Also recommended now (harmless, needs your click):** Settings → Code security → enable **Secret scanning** and **Push protection**.

## 3. Other security items

| Item | Status |
|---|---|
| Dependency vulnerabilities | Backend: `pip-audit` clean on the branch. Frontend runtime: axios fixed; react-router v6 advisories unreachable (documented). Build tooling advisories don't ship to browsers. |
| Admin endpoints | Shared `X-Admin-Key` (constant-time compare; fails closed). New retention endpoint is admin-only and dry-run by default. |
| Personal data in logs | None from the app (emails masked; form bodies never logged). Cloud Run request logs hold IP addresses (default 30-day retention). |
| Production deploy path | Any push to `main` deploys the backend at 100% traffic (Cloud Build trigger `^main$`). **Do not merge without the staging plan.** |
