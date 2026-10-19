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

## Owner actions: rotate the credential

The zero-downtime approach is recommended: create a new user, switch Cloud Run over, then delete the old user.

### A. MongoDB Atlas

1. Sign in at https://cloud.mongodb.com → choose the Tiny Explorers project.
2. **Check for misuse first.**
   - Open **Security → Network Access**.
     - If `0.0.0.0/0` (access from anywhere) is listed, the leaked credential was usable from the internet.
     - In that case, open **Project → Activity Feed** and the cluster's **Monitoring → Connections** for anything unusual since 2026-08-28.
   - Look at the collections `newsletter`, `enrollment`, `inquiry` and `admissions` for unexpected deletions or unknown records.
3. **Create a replacement user.**
   - Go to **Security → Database Access → Add New Database User**.
   - Authentication: Password → **Autogenerate Secure Password** → copy it somewhere safe (a password manager).
   - Privileges: **Specific privileges → `readWrite` on database `tiny_explorers` only**. Do not use "Atlas admin" or "read and write to any database".
   - Give it a new username, e.g. `te-api-2026-10`.
4. Build the new connection string:
   `mongodb+srv://<new-user>:<new-password>@<cluster-host>/?retryWrites=true&w=majority&appName=<app-name>`.
   Use the same cluster host as today.
5. Optional hardening: restrict Network Access. Cloud Run has no fixed outbound IP unless you set up a VPC connector with Cloud NAT, so this is optional for now.

### B. Google Cloud Run (service `tinyexplorers-production`, region `us-east1`)

The recommended way stores the URI in Secret Manager instead of a plain environment variable.

```bash
gcloud config set project <your-project-id>          # project number 784723417768
printf '%s' 'mongodb+srv://…new…' | gcloud secrets create mongo-url --data-file=- --replication-policy=automatic
#   (if the secret already exists: gcloud secrets versions add mongo-url --data-file=-)

# Allow the Cloud Run runtime service account to read it
gcloud run services describe tinyexplorers-production --region us-east1 \
  --format='value(spec.template.spec.serviceAccountName)'
gcloud secrets add-iam-policy-binding mongo-url \
  --member='serviceAccount:<runtime-sa-email>' --role='roles/secretmanager.secretAccessor'

# Point the service at the secret (replaces the plain env var)
gcloud run services update tinyexplorers-production --region us-east1 \
  --remove-env-vars=MONGO_URL --update-secrets=MONGO_URL=mongo-url:latest
```

Console alternative: **Cloud Run → tinyexplorers-production → Edit & deploy new revision → Variables & Secrets** → replace `MONGO_URL` (or reference the secret) → **Deploy**.

Safety notes:
- With `ENVIRONMENT=production` the API refuses to start if `MONGO_URL` is missing or a placeholder. A bad value therefore fails the new revision, and traffic stays on the previous healthy revision.
- Avoid typing the URI into a shell that saves history. Using `printf` from a password manager paste, or the console UI, is safest.

### C. Verify, then retire the old user

1. Visit `https://tinyexplorers-production-784723417768.us-east1.run.app/api/health`. It should report `"database": "connected"`.
2. Submit one test newsletter signup on the preview site. Confirm it appears in Atlas and that there are no errors in **Cloud Run → Logs**.
3. In Atlas, **Database Access → delete the old user** (the one named in the leaked string). This invalidates the leaked password.
4. Tell the development session the rotation is done. Item C1 in `PRODUCTION_READINESS.md` will then be closed.

### D. Prevent recurrence (recommended)

- GitHub → repository **Settings → Code security**: enable **Secret scanning** and **Push protection**. Both are free for public repositories.
- Rule for contributors and AI sessions: test fixtures must use synthetic hosts and credentials (see `DEVELOPMENT_HANDOFF.md`).
- Consider making the repository **private**. GitHub Pages from a private repo requires a paid plan; a different static host does not (see the hosting evaluation in `PRODUCTION_READINESS.md`).
