# Security note: possible MongoDB Atlas credential exposure (2026-10-19)

**Status:** fixture sanitised in the repository. **Credential rotation is still pending (owner action).**
**Severity:** Critical until rotated. Treat it as a real exposure.

## What was found

- **File:** `backend/tests/test_mongo_url_validation.py` (test `test_real_production_atlas_hostname_format_is_valid`).
- **Introduced in:** commit `ba4f124` (2026-08-28, "test(backend): lock in real Atlas hostname/appName format…").
- **What it contained:** a complete `mongodb+srv://` connection string made up of:
  - the **real production Atlas cluster hostname**;
  - a realistic application username;
  - a **16-character mixed-case alphanumeric password with no dictionary words**. This is exactly the format of Atlas's "Autogenerate Secure Password" feature.
- **Repository visibility:** **public**, so the string has been publicly readable since 2026-08-28.
- **Other occurrences:** a search of every ref and the whole history (`git log --all -S`, `git grep` over all revisions) found the password string **only in that one file, introduced only in `ba4f124`**.
  - It is **not** in the published `gh-pages` build.
  - It is **not** in documentation, configuration or `.env.example` files.
- **Could it be verified?** No. The audit sandbox cannot reach Atlas, and attempting a login with a possibly real credential would itself be inappropriate. The password was never printed during the audit.

**Conclusion:** the string looks like a usable production credential. Rotate it.

## What has been done in the repository

- The fixture now uses synthetic values: a fake host, a fake username, and a password that says it is synthetic. The same URI *shape* is kept so the test still checks what it was written to check. All 12 tests in that file pass.
- Git history has **not** been rewritten and nothing has been force-pushed, as instructed. The old value stays reachable in commit `ba4f124`. Once the password is rotated it is useless, so a rewrite is not required.

## Owner runbook: rotate the credential (step by step)

Each step says whether it **changes anything live**. Steps marked ⛔ **STOP** need confirmation in the development session before continuing.
- Never paste a password or connection string into chat, a ticket or a commit.
- Keep the new password only in a password manager and in Google Secret Manager.

Names used below:
- GCP project `tiny-explorers-staff-portal`, region `us-east1`, Cloud Run service `tinyexplorers-production`.
- Database `tiny_explorers`.

### Step 1: Inspect (read-only, changes nothing)

**1a.** In Atlas (https://cloud.mongodb.com → Tiny Explorers project → **Security → Database & Network Access**):
- Note the **username** of the user the website uses. It is the one shown in the leaked fixture. Usernames are not secret, so you may share it.
- Note that user's **role**.
- On **Network Access (IP Access List)**: note whether `0.0.0.0/0` ("allow access from anywhere") is listed.

**1b.** Atlas → **Project → Activity Feed** and cluster **Metrics → Connections**, from 2026-08-28 to now. Look for:
- connection spikes at odd times;
- database users or API keys you don't recognise;
- unexpected changes.

Then Data Explorer → `tiny_explorers`: check whether record counts look plausible and nothing is missing.

**1c.** In Google Cloud Console → **Cloud Run → `tinyexplorers-production` → Revisions** tab:
- Note the revision serving 100% of traffic. This is the **rollback revision**.
- Open **Variables & Secrets**: is `MONGO_URL` a plain environment variable or a Secret Manager reference? (Don't copy the value.)

⛔ **STOP. Report back:** the username and role, whether `0.0.0.0/0` is listed, anything unusual in the activity feed, the rollback revision name, and whether `MONGO_URL` is an env var or a secret.

### Step 2: Create the replacement database user (additive; live site unaffected)

Atlas → **Database Access → Add New Database User**:
- Authentication: **Password → Autogenerate Secure Password → Copy**. Save it straight into your password manager.
- Username: e.g. `te-api-2026-10`.
- **Database User Privileges → Add Specific Privilege → `readWrite` @ `tiny_explorers`**. Nothing broader.
- Leave "Restrict access to specific clusters" on the website's cluster.

Then build the new connection string, using the cluster host from Atlas → **Connect → Drivers**:
`mongodb+srv://te-api-2026-10:<new-password>@<cluster-host>/?retryWrites=true&w=majority&appName=<app-name>`

⛔ **STOP. Confirm** the user was created. Do not share the password.

### Step 3: Store the new connection string in Secret Manager (additive; live site unaffected)

Console → **Security → Secret Manager → Create secret**:
- Name: `mongo-url`.
- Value: paste the new connection string.
- Replication: automatic.

Then give the Cloud Run runtime service account access:
- Find it under Cloud Run → service → **Security** tab → "Service account". If it says "Default compute service account", that is `<project-number>-compute@developer.gserviceaccount.com`.
- Secret Manager → `mongo-url` → **Permissions → Grant access** → that account → role **Secret Manager Secret Accessor**.

CLI equivalent:

```bash
gcloud config set project tiny-explorers-staff-portal
gcloud secrets create mongo-url --replication-policy=automatic --data-file=-   # paste, then Ctrl-D
gcloud secrets add-iam-policy-binding mongo-url \
  --member="serviceAccount:<runtime-service-account>" --role=roles/secretmanager.secretAccessor
```

⛔ **STOP. Confirm** the secret exists and the access grant is in place.

### Step 4: Verify the new credential on a zero-traffic revision (live traffic unaffected)

This creates a new revision with the **same code that is live today**, but using the new secret. It receives **0% of traffic** and gets a private test URL.

```bash
gcloud run services update tinyexplorers-production --region us-east1 \
  --no-traffic --tag rotate \
  --remove-env-vars=MONGO_URL --update-secrets=MONGO_URL=mongo-url:latest
```

If `MONGO_URL` was already a secret in step 1c, drop `--remove-env-vars=MONGO_URL`.

Console alternative:
- **Edit & deploy new revision** → Variables & Secrets → remove the `MONGO_URL` variable → **Reference a secret** → `mongo-url`, latest, exposed as env var `MONGO_URL`;
- tick **"Serve this revision immediately" = OFF**;
- add the revision tag `rotate`.

Verify on the tag URL, `https://rotate---tinyexplorers-production-<hash>.us-east1.run.app`:
1. `/api/health` returns `"database": "connected"`. If it says `unavailable`, the new user or password or network access is wrong. Nothing live is affected; fix it and repeat.
2. Optional: the revision's logs show `Connected to MongoDB database tiny_explorers`.

⛔ **STOP. Report** the `/api/health` result from the `rotate` URL.

### Step 5: Move live traffic to the verified revision (⚠ live change, instantly reversible)

```bash
gcloud run services update-traffic tinyexplorers-production --region us-east1 --to-tags rotate=100
```

Then check:
- `https://tinyexplorers-production-784723417768.us-east1.run.app/api/health` returns `connected`;
- one newsletter signup from the preview site with a test address you own is stored and the welcome email arrives;
- no errors in Cloud Run Logs for 15 minutes.

**Rollback:** `gcloud run services update-traffic tinyexplorers-production --region us-east1 --to-revisions <rollback-revision>=100`. This works because the old user still exists.

**Continuous deployment:** future `main` merges keep using the secret, because they only replace the image.

⛔ **STOP. Confirm** the site has been healthy on the new credential. Recommended: wait at least 24 hours.

### Step 6: Retire the leaked credential (⚠ irreversible for the old password)

Atlas → **Database Access** → the old user → **Delete**. Alternatively, Edit → Edit Password → autogenerate a random one and discard it.

From this moment the leaked password is useless.

**Note:** Cloud Run revisions created *before* step 5 still contain the old password. Rolling back to them would now fail with 503. Only roll back to revisions from step 5 onward.

⛔ **STOP. Confirm.** The development session then closes finding C1.

### Step 7: Prevent recurrence (recommended, no impact on the site)

- GitHub → repository **Settings → Code security**: enable **Secret scanning** and **Push protection** (free for public repositories).
- Consider making the repository **private**. GitHub Pages from a private repo requires a paid plan; Cloudflare Pages does not (see `PRODUCTION_READINESS.md` §7).
- Rule for contributors and AI sessions: test fixtures use synthetic hosts and credentials only (see `DEVELOPMENT_HANDOFF.md`).
- Optional: restrict Atlas Network Access to Cloud Run egress. That requires a VPC connector with Cloud NAT and a static IP, so it is a later improvement.
