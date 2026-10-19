# Backend zero-traffic staging revision plan (Milestone 2, step 2.0)

_Status: **PLAN ONLY, not executed.** Every step that touches Google Cloud or Atlas needs the owner's go-ahead at that step._

**Goal:** run the Milestone 1 backend as a new revision of the existing Cloud Run service `tinyexplorers-production` (project `tiny-explorers-staff-portal`, region `us-east1`), receiving **0% of public traffic**. Test it through a private revision URL, then shift traffic, with rollback available at every stage.

Prerequisites:
- **C1 credential rotation done**, so the revision and production both use the new database user.
- Owner has read `DEPLOYMENT_BEHAVIOR.md` (merging to `main` auto-deploys).
- `gcloud` is authenticated as a project owner/editor, or the Cloud Console is used.

```bash
PROJECT=tiny-explorers-staff-portal
REGION=us-east1
SERVICE=tinyexplorers-production
BRANCH=claude/trusting-ramanujan-v9r2or
```

## 0. Record the current state (read-only; needed for rollback)

**Recorded by the owner on 2026-10-19:** `$STABLE_REVISION` = `tinyexplorers-production-00021-9s9` (100% traffic). `MONGO_URL` = secret `mongo_url`, version `latest`. Cloud Build trigger branch filter `^main$`.

**Atlas access is currently unavailable** (see `docs/security/atlas-access-recovery.md`). Step 1 below (duplicate check and snapshot) cannot be done yet, so this plan is blocked until access is recovered.


```bash
gcloud config set project $PROJECT
gcloud run services describe $SERVICE --region $REGION --format='value(status.traffic)'
gcloud run revisions list --service $SERVICE --region $REGION --limit 5
# Write down the revision currently serving 100% -> $STABLE_REVISION
gcloud run services describe $SERVICE --region $REGION \
  --format='yaml(spec.template.spec.containers[0].env)' | grep -E 'name:' # names only; values are not needed
```

## 1. Database checks before the new code touches production data (read-only)

The new startup code runs `create_index` for:

| Collection | Index | Notes |
|---|---|---|
| `newsletter` | `{email: 1}` **unique**, name `email_unique` | Fails if duplicate emails already exist. Startup continues and logs `Could not create index email_unique…`. |
| `newsletter` | `{status: 1}`, `{created_at: -1}` | Small, non-blocking |
| `enrollment`, `inquiry`, `admissions` | `{created_at: -1}` | Small, non-blocking |

These indexes are **additive only**. No documents are modified, and the old revision ignores them. Building them on collections this small takes seconds. MongoDB builds indexes without locking the collection for the whole build (4.2+).

In **Atlas → Data Explorer → `tiny_explorers.newsletter` → Aggregations**, check for duplicates first. This is read-only:

```js
[{ $group: { _id: { $toLower: "$email" }, n: { $sum: 1 }, ids: { $push: "$id" } } },
 { $match: { n: { $gt: 1 } } }]
```

- **No results:** the unique index will be created.
- **Results:** decide which record to keep (the earliest `created_at`, or the one with `status: "subscribed"`) and delete the others before step 3. This is a data change and needs owner approval.
- Mixed-case duplicates (`A@x.com` vs `a@x.com`) will **not** be blocked by the index. New signups are lower-cased, but old ones may not be.

Also take an **on-demand snapshot or export** before step 3:
- Atlas → cluster → **Backup → Take snapshot now** (M10+); or
- Data Explorer → **Export collection** (M0/Flex), or `mongodump` with a read-only user.

## 2. Environment variables for the new revision

| Variable | Value | Change? |
|---|---|---|
| `ENVIRONMENT` | `production` | unchanged |
| `MONGO_URL` | Secret Manager reference. Today: `mongo_url:latest`. After C1 rotation: `mongo_url_2026_10:1` | unchanged until C1 |
| `DB_NAME` | `tiny_explorers` | unchanged |
| `CORS_ORIGINS` | current preview origin (`https://tw4ntyx-cloud.github.io`) | unchanged |
| `CORS_ALLOW_CREDENTIALS` | `false` | unchanged |
| `ADMIN_API_KEY` | existing (rotation optional; recommended at launch) | unchanged |
| `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL` | existing | unchanged |
| `WEBSITE_URL` | current preview URL | unchanged |
| `GOOGLE_*` | existing | unchanged |
| **`TRUSTED_PROXY_HOPS`** | **`1`** | **new** |
| **`EMAIL_SEND_TIMEOUT_SECONDS`** | `10` (default; can be omitted) | new, optional |

Environment variables are set on the **service** template, so the next revision gets them. Setting them together with the zero-traffic deploy (step 3) means the current serving revision is not touched.

## 3. Deploy the branch as a zero-traffic revision (needs approval)

Build from the branch source without merging:

```bash
git clone --branch $BRANCH https://github.com/tw4ntyx-cloud/tinyexplorers-production && cd tinyexplorers-production/backend
gcloud run deploy $SERVICE --region $REGION --source . \
  --no-traffic --tag staging \
  --update-env-vars TRUSTED_PROXY_HOPS=1
```

- `--no-traffic` keeps 100% of public traffic on `$STABLE_REVISION`.
- `--tag staging` gives the revision a private URL: `https://staging---tinyexplorers-production-<hash>.us-east1.run.app`.
- Existing variables and secrets carry over automatically.

Expected startup logs (Cloud Run → Logs, filter by the new revision):
- `Connected to MongoDB database tiny_explorers`
- no `Could not create index` errors (or the expected duplicate warning from step 1).

## 4. Verification tests against the `staging` URL

Run these against the staging URL only. Use test data marked `TEST`, and an inbox you control as the parent email.

| # | Test | Expected |
|---|---|---|
| V1 | `GET /api/health` | `200`, `"database": "connected"` |
| V2 | `GET /api/newsletter` without key | `401`; with `X-Admin-Key` → `200` |
| V3 | `POST /api/newsletter` (test address) | `201`; record in Atlas; welcome email arrives |
| V4 | Repeat V3 with the same address | `200/201` and `already_subscribed: true`; still one record |
| V5 | `POST /api/inquiry` with `contact_method: "Phone"` and no phone | `422` |
| V6 | `POST /api/inquiry` with phone | `201`; staff email to `hello@` shows **Phone**; parent confirmation arrives |
| V7 | `POST /api/admissions` and `POST /api/enrollment` (test data) | `201`; both emails arrive; records in Atlas |
| V8 | Rate limit: 6 quick `POST /api/enrollment` from one machine | 6th returns `429`; a request from another network still gets `201` (confirms `TRUSTED_PROXY_HOPS=1`) |
| V9 | Atlas → `newsletter` → Indexes | `email_unique` present (unique) |
| V10 | Response headers | `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` present |
| V11 | Logs | Parent emails appear masked (`t***@domain`); no stack traces |
| V12 | Preview site against staging (optional) | Run `npm start` locally with `REACT_APP_BACKEND_URL=<staging URL>`, then submit each form once. Requires temporarily adding `http://localhost:3000` to `CORS_ORIGINS`, or test with curl instead. |

A ready-made smoke script is `docs/deployment/smoke-test.sh` (usage: `./smoke-test.sh <base-url> <your-test-inbox>`). It refuses to run against `localhost` unless asked, and marks every record `TEST`.

Clean up afterwards: delete the `TEST` records in Atlas (owner approval), or leave them and mark them in the admin view later.

## 5. Shift traffic (needs approval)

Optional canary step:

```bash
gcloud run services update-traffic $SERVICE --region $REGION --to-tags staging=10   # optional canary
```

Then move all traffic to the new revision:

```bash
gcloud run services update-traffic $SERVICE --region $REGION --to-latest
```

Watch Logs and error rates for 30 minutes after shifting.

## 6. Rollback (seconds, no rebuild)

```bash
gcloud run services update-traffic $SERVICE --region $REGION --to-revisions $STABLE_REVISION=100
```

- **The indexes can stay.** The old code works with them. The only effect of the unique index on the old code is that a duplicate newsletter insert would raise, which returns `503` instead of creating a duplicate. Acceptable, or drop the index: `db.newsletter.dropIndex("email_unique")`.
- **No document or schema migrations exist**, so there is nothing else to undo.
- **If the rotated credential is the problem:** the old revision uses whatever `MONGO_URL` the service had when it was created. Revisions are immutable, so rolling back to it brings the old credential back too. **Do not delete the old Atlas user until this plan is complete** (C1 step order).

## 7. Merge to `main` afterwards (needs approval)

When the merge lands, continuous deployment builds the same code and deploys a revision at 100% traffic. Because the staging revision already passed, this is expected to be a no-op functionally. Re-run V1 and V3 afterwards.

Alternative: before merging, edit the trigger's deploy step to add `--no-traffic` permanently. Every `main` build then needs a manual traffic shift, which is safer but adds a step. Decide this as part of Milestone 2.
