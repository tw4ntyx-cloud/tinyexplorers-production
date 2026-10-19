# Keeping the preview out of search engines

_Prepared 2026-10-19. **Nothing deployed has been changed.** The live GitHub Pages preview is untouched until an approved merge to `main`._

## The problem

`https://tw4ntyx-cloud.github.io/tinyexplorers-production/` is public and is built from `main`. It shows older wording (pre-round-1 claims, street address) and its forms reach the live Cloud Run API. If Google indexes it, families could find outdated claims, and later it could compete with the real domain as duplicate content.

## What is prepared on the development branch

| Change | Effect |
|---|---|
| `frontend/public/index.html`: `<meta name="robots" content="%REACT_APP_ROBOTS%" />` | Indexing is set per build. |
| `frontend/.env.production` and `.env.development`: `REACT_APP_ROBOTS=noindex, nofollow` | Every build from this branch tells search engines not to index or follow. |
| `.github/workflows/deploy-gh-pages.yml` | The preview deploy **fails** unless the built page carries `noindex, nofollow` and no unfilled `%REACT_APP_…%` placeholder. |
| `.github/workflows/ci.yml` | CI fails on any unfilled `%REACT_APP_…%` placeholder. |

`robots.txt` stays `Allow`. A crawler must be able to fetch a page to see its `noindex`; blocking it in robots.txt would leave already-known URLs listed without a description.

## When it takes effect

Only when the branch is merged to `main` (approval required). That merge **also deploys the backend to Cloud Run** through the `^main$` Cloud Build trigger, so it follows `cloud-run-staging-plan.md`. There is no way to change the preview alone without a deploy; this is intentional.

## Optional, no deploy needed (owner action, 5 minutes)

1. Google Search Console → add property `https://tw4ntyx-cloud.github.io/tinyexplorers-production/` (verify with the HTML-file method, which does need a commit, or skip if not wanted).
2. Check **Pages → Indexed** to see if anything is listed today. A quick check without an account: search `site:tw4ntyx-cloud.github.io tinyexplorers`.
3. If pages are listed: **Removals → New request** hides them for about six months while the `noindex` takes effect.

## At production launch

- The production build on the real domain must set `REACT_APP_ROBOTS=index, follow` (Cloudflare Pages environment variable, or a `.env.production` change in the launch PR). The launch checklist in `PRODUCTION_READINESS.md` records this.
- Turn off or redirect the GitHub Pages preview once the real domain is live, or keep it with `noindex`.
- Submit the real domain's `sitemap.xml` in Search Console.

## Taking the preview down (alternative, needs approval)

GitHub → repository **Settings → Pages → Unpublish site**. Reversible by re-running the deploy workflow. It also stops anyone seeing the out-of-date content and reaching the live API from it.
