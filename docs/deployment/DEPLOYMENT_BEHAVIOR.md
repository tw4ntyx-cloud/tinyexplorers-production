# How deployment works today

_Determined 2026-10-19 from GitHub check-run data on public commits. No access to the Google Cloud console was used._

## Summary

| Push or merge to | What happens automatically | Affects production? |
|---|---|---|
| **`main`** | **1. Google Cloud Build** trigger `rmgpgab-tinyexplorers-production-us-east1-tw4ntyx-cloud-tinykcb` (GCP project **`tiny-explorers-staff-portal`**) builds the backend and deploys it to Cloud Run. | **Yes: the live API** |
| | **2. GitHub Actions** `CI` runs the tests. | No |
| | **3. GitHub Actions** `Deploy GitHub Pages` rebuilds the preview site (only when `frontend/**`, the workflow or `README.md` changed). | Preview site only |
| any other branch (e.g. `claude/…`) | Nothing deploys. CI only runs for PRs targeting `main`. | No |
| pull request to `main` | CI runs. Cloud Build did **not** run on PRs (none observed). | No |

**Consequence:** merging any change to `main` redeploys the production API within about 3 minutes, even changes that only touch docs. The observed build for `ac777b1` (a workflow-only change) still ran for 2 min 56 s.

## Evidence

- Every `main` commit since `71a262b` (2026-08-28) has a `google-cloud-build` check run on that trigger.
  - Examples: `98ea9e1`, `b7a05ac`, `9b582f1`, `ac777b1`, all successful.
  - Earlier commits (`93b3480`, `84082b6`) have only GitHub Actions checks, so the trigger was created on 2026-08-28.
- None of the `claude/trusting-ramanujan-v9r2or` commits have a Cloud Build check run, so the trigger is filtered to `main`.
- The `rmgpgab-<service>-<region>-<owner>-<repo>` naming is what Cloud Run's **"Continuously deploy from a repository"** console feature generates. It builds the container with Cloud Build and deploys a new revision of service **`tinyexplorers-production`** in **`us-east1`**.
- By default that feature deploys with **100% of traffic** going to the new revision.
- Trigger ID: `72528701-17a7-48a3-8943-7f3cc67c90be`. Build logs are linked from each check run in the GitHub UI.

## Confirmed by the owner in the Cloud Console (2026-10-19)

- Project **tiny-explorers-staff-portal**, service **tinyexplorers-production**, region **us-east1**.
- Serving revision **tinyexplorers-production-00021-9s9** at **100%** traffic.
- Source repository `tw4ntyx-cloud/tinyexplorers-production`; Cloud Build trigger branch regex **`^main$`**.
- **Pushing to `main` deploys to production automatically.**
- `MONGO_URL` is the Secret Manager secret `mongo_url`, version `latest`.

## Still to confirm in the Cloud Console (owner, read-only)

1. **Cloud Build → Triggers** → open the trigger (project `tiny-explorers-staff-portal`, region global). Note:
   - the branch regex (expected `^main$`);
   - the build config (Dockerfile path `backend/Dockerfile`, or an inline/`cloudbuild.yaml` config);
   - the deploy step flags (whether it uses `--no-traffic`).
2. **Cloud Run → `tinyexplorers-production` → Revisions.** Confirm that each recent revision matches a `main` commit and that traffic is 100% on the latest.
3. **Included/ignored files filter.** Check whether the trigger ignores `frontend/**` or `docs/**`. Evidence suggests it does not.

## Settings that a deploy keeps

Continuous deployment replaces only the **container image**. Environment variables, secrets, service account, scaling and ingress settings set on the service stay as they are on new revisions. A merge therefore does **not** reset `MONGO_URL`, `RESEND_API_KEY`, etc. New settings such as `TRUSTED_PROXY_HOPS` have to be added to the service separately.

## Implications for merging the Milestone 1 branch

Merging `claude/trusting-ramanujan-v9r2or` would automatically put the following live:
- the FastAPI/Starlette/PyMongo upgrades;
- startup index creation on the production database (including the **unique newsletter email index**);
- the non-blocking email change;
- the inquiry phone validation.

Because of that, follow `docs/deployment/cloud-run-staging-plan.md` **before** merging. Either:
- **(a)** deploy and verify a zero-traffic revision first, then merge; or
- **(b)** temporarily switch the trigger to deploy with no traffic.
