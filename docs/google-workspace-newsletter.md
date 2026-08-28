# Newsletter → Google Workspace Group

This document describes how the website's "Subscribe" form connects to the
**Tiny Explorers Newsletter** Google Group (`newsletter@tinyexplorersbda.com`),
what is implemented in code today, and the exact steps a Google Workspace
administrator must complete to turn on automatic membership sync.

> No Google Workspace credentials exist anywhere in this repository. Nothing
> below has been "configured" or "verified" by an AI agent — it only becomes
> active once a human admin completes the setup steps and sets the resulting
> configuration on the backend host, and it has not been tested against a
> real Workspace environment.

## Current status (2026-08-28)

The following has been completed manually in Google Cloud / Admin Console:

- Admin SDK API enabled.
- Service account **Tiny Explorers Newsletter** created.
- Domain-wide delegation configured, authorized for **only** the
  `https://www.googleapis.com/auth/admin.directory.group.member` scope.
- Target group confirmed: `newsletter@tinyexplorersbda.com`.

**Constraint:** the Google Cloud organization enforces
`iam.managed.disableServiceAccountKeyCreation`, so a downloadable JSON key
for the service account cannot be created. **This policy should stay
enabled** — it is a legitimate security control, not a blocker to work
around. The backend now supports a **keyless** authentication mode designed
for exactly this situation (see below), in addition to the original
JSON-key mode kept only for local development.

## Current architecture

```
Website (Footer subscribe form)
   ↓ POST /api/newsletter  (validated, rate-limited, trimmed + lowercased email)
Backend (FastAPI, backend/server.py)
   ↓
1. Check MongoDB "newsletter" collection for an existing subscriber (dedup)
   → already present: respond success, no changes
2. Store the subscription request: {id, email, status, created_at, updated_at}
3. Attempt Google Workspace membership via backend/google_workspace.py
   - Added / already a member  → status = "subscribed"
   - Not configured / failed   → status = "pending" (never discarded)
4. Send a welcome email (best-effort, does not affect stored status)
   ↓
Admin (X-Admin-Key header) can:
   - GET  /api/newsletter                 → review all subscribers
   - POST /api/admin/newsletter/sync      → retry Google Group membership
                                             for everyone still "pending"
   - POST /api/admin/newsletter/unsubscribe → mark a subscriber unsubscribed
                                               and best-effort remove them
                                               from the Google Group
```

`backend/google_workspace.py` is the **only** module that talks to Google. It
is never imported by frontend code, never logs credentials or subscriber
emails, and never raises — every function returns a plain result string
(`"added"`, `"already_member"`, `"not_configured"`, `"failed"`, etc.) so the
API never leaks Google API internals, stack traces, or configuration details
to end users.

## Two supported authentication modes

| | KEYLESS (recommended) | SERVICE_ACCOUNT_JSON (legacy) |
|---|---|---|
| Requires a downloaded private key | **No** | Yes |
| Works with `iam.managed.disableServiceAccountKeyCreation` enforced | **Yes** | No |
| How it authenticates | Uses the runtime's Application Default Credentials (ADC) to sign a domain-wide-delegation JWT via the IAM Credentials API (`signBlob`), then exchanges it for a short-lived Workspace access token. The private key material never leaves Google's infrastructure. | Loads a downloaded service-account JSON key and signs the delegation JWT locally with its private key. |
| Where it works out of the box | Google Cloud compute with an attached service account identity — Cloud Run, GCE, GKE — or locally via `gcloud auth application-default login` | Anywhere (any host, since the key is self-contained) |
| Env vars required | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_WORKSPACE_ADMIN_EMAIL`, `GOOGLE_NEWSLETTER_GROUP_EMAIL` | `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_WORKSPACE_ADMIN_EMAIL`, `GOOGLE_NEWSLETTER_GROUP_EMAIL` |

If both `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_SERVICE_ACCOUNT_EMAIL` are
set, the JSON key takes precedence (useful for local testing). In
production, prefer leaving `GOOGLE_SERVICE_ACCOUNT_JSON` unset and using the
keyless mode.

`google_workspace.configured_auth_mode()` reports which mode is active
(`"keyless"`, `"service_account_key"`, or `"not_configured"`) and is surfaced
in the `POST /api/admin/newsletter/sync` response for operational visibility
— it never exposes secrets, only which mode is selected.

## What is NOT implemented yet

- **No credentials/config are set on any backend host.** Until an admin sets
  the env vars for one of the two modes above, every subscriber lands as
  `status: "pending"` and `POST /api/admin/newsletter/sync` is a safe no-op.
- **The keyless flow has not been tested against the real Workspace
  environment.** The code implements the documented Google pattern for
  domain-wide delegation without a key, but this has not been exercised
  against `tinyexplorersbda.com` — treat it as implemented, not verified.
- **No scheduled job runs the sync automatically.** `POST
  /api/admin/newsletter/sync` must currently be triggered manually — the
  endpoint was written so a scheduler (e.g. Cloud Scheduler, if hosting on
  Cloud Run) can call it later without any code changes.
- **No public self-service unsubscribe endpoint.** There is only an
  admin-gated `POST /api/admin/newsletter/unsubscribe` for staff to use in
  the interim. See "Recommended secure unsubscribe workflow" below for what
  to build before ever exposing unsubscribe publicly.

---

## Step-by-step setup guide (for the Google Workspace administrator)

Steps 1–2 and 4–6 below are the same as what you've already completed. They
are included for completeness/reference.

### 1. Google Cloud project — ✅ already done
Admin SDK API is enabled on your project.

### 2. Service account — ✅ already done
**Tiny Explorers Newsletter** service account exists. Note its **email
address** (looks like `tiny-explorers-newsletter@<project-id>.iam.gserviceaccount.com`)
— this is the value for `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

### 3. Service-account key — intentionally skipped (keyless mode)
Because `iam.managed.disableServiceAccountKeyCreation` is enforced, no JSON
key exists or should be created. **Do not ask an org admin to disable this
policy.** The keyless auth mode does not need one.

### 4. Domain-wide delegation — ✅ already done
Configured with only the
`https://www.googleapis.com/auth/admin.directory.group.member` scope,
authorized against the service account's Client ID. Nothing further needed
here unless the scope ever needs to change.

### 5. Choose the Workspace admin account to impersonate — confirm this
Domain-wide delegation requires the service account to act *as* a real
Workspace user with permission to manage group membership (a super admin, or
an admin with the "Groups" privilege). This is `GOOGLE_WORKSPACE_ADMIN_EMAIL`.
Use a role account if one exists (e.g. `it-admin@tinyexplorersbda.com`), not
a personal account.

### 6. Grant the runtime identity permission to sign as the service account

This is the one **new** IAM step required for keyless auth. Whatever
identity actually runs the backend process (e.g. a Cloud Run service's
attached service account — which may be this same **Tiny Explorers
Newsletter** service account, or a separate "runtime" service account) needs
the **Service Account Token Creator** role
(`roles/iam.serviceAccountTokenCreator`) on the **Tiny Explorers Newsletter**
service account:

1. In Cloud Console, open **IAM & Admin → Service Accounts**.
2. Click the **Tiny Explorers Newsletter** service account → **Permissions** tab.
3. **Grant Access** → add the runtime identity (itself, if the backend runs
   directly as this service account, or a separate runtime service account)
   with role **Service Account Token Creator**.

If the backend runs directly as the **Tiny Explorers Newsletter** service
account (simplest setup — see the hosting comparison below), it is
"self-impersonating" to sign the delegation JWT; you still need to grant it
this role on itself.

### 7. Set the backend environment variables

Set these on whichever host runs `backend/` in production — see the hosting
comparison below for why Google Cloud Run is now the easiest fit for the
keyless mode:

| Variable | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The **Tiny Explorers Newsletter** service account's email address |
| `GOOGLE_WORKSPACE_ADMIN_EMAIL` | The admin account chosen in step 5 |
| `GOOGLE_NEWSLETTER_GROUP_EMAIL` | `newsletter@tinyexplorersbda.com` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Leave unset in production (legacy/local-only) |

### 8. Restart/redeploy the backend

The backend reads these at process startup. Redeploy or restart so
`google_workspace.is_configured()` starts returning `True`.

### 9. Test membership addition

With the backend running and configured, submit a brand-new test email
through the website's Subscribe form (or `POST /api/newsletter`), then check:

- `GET /api/newsletter` (with `X-Admin-Key`) shows `status: "subscribed"`
  for that email.
- The address appears as a member in the Google Admin Console under
  **Directory → Groups → Tiny Explorers Newsletter → Members**.

### 10. Test duplicate membership handling

Submit the same email again through the form. Expect:

- The API responds with `already_subscribed: true` (no error).
- No duplicate entry is created, and the Google Group membership call is
  never retried for an existing subscriber record (Google itself also
  safely no-ops via a 409 response if it were ever retried).

### 11. Test failure/retry (pending sync)

1. Temporarily unset `GOOGLE_SERVICE_ACCOUNT_EMAIL` (or briefly revoke the
   `roles/iam.serviceAccountTokenCreator` grant from step 6) and restart.
2. Submit a new test subscription — confirm it's stored with
   `status: "pending"` and no error is shown to the visitor.
3. Restore the correct configuration and restart.
4. Call `POST /api/admin/newsletter/sync` with `X-Admin-Key` — confirm the
   test subscriber flips to `status: "subscribed"` and the group now
   contains them. Check the response's `google_workspace_auth_mode` field to
   confirm which mode actually ran.

### 12. Credential rotation / revocation (keyless mode)

There is no key file to rotate. To revoke access instead:

- Remove the `roles/iam.serviceAccountTokenCreator` grant (step 6) — this
  immediately stops the runtime identity from being able to sign as the
  **Tiny Explorers Newsletter** service account.
- Or remove the domain-wide delegation entry in the Admin Console (step 4)
  to immediately stop it from being able to call the Admin SDK at all.
- If you ever do use the legacy JSON-key mode locally: treat the key file
  like a database password (secrets manager only, never source control),
  and delete/rotate it via the service account's **Keys** tab.

---

## Hosting comparison for keyless authentication

Because `iam.managed.disableServiceAccountKeyCreation` is enforced (correctly
— do not disable it), **true keyless Google Workspace auth (ADC) only works
out of the box when the backend runs on Google Cloud compute** (Cloud Run,
GCE, or GKE) using an attached/default service account identity. Running the
backend on a non-Google host (Render, Fly, Railway, etc.) would require
either:

- a downloaded service-account key (**blocked** by the org policy), or
- Workload Identity Federation with an external OIDC provider — Google
  supports this for platforms that can emit a verifiable OIDC token (e.g.
  AWS, Azure, GitHub Actions), but most general-purpose PaaS hosts do not
  expose this by default, making it meaningfully more setup than Cloud Run.

**Recommendation:** if/when the backend is deployed to production, prefer
**Google Cloud Run** specifically because it removes the extra federation
step — the keyless code path in `google_workspace.py` should work using
Cloud Run's attached service account identity directly. This has not been
deployed or tested yet; it is a recommendation, not a completed migration.

## Recommended secure unsubscribe workflow (not yet built)

The backend already supports `status: "unsubscribed"` and an admin-gated
`POST /api/admin/newsletter/unsubscribe` for staff use. Before exposing
self-service unsubscribe on the public website, build:

1. Include a unique, signed, single-use token in each newsletter/welcome
   email (e.g. `unsubscribe_token` stored per-subscriber, generated with
   `secrets.token_urlsafe`, never derived from the email itself).
2. A public `GET/POST /api/newsletter/unsubscribe?token=...` endpoint that
   looks up the subscriber **by token only** (never by raw email in the
   URL), sets `status: "unsubscribed"`, and calls
   `google_workspace.remove_subscriber_from_group`.
3. Rate-limit that endpoint the same way `/api/newsletter` is rate-limited.
4. Never return whether a token was valid/invalid in a way that lets someone
   enumerate other subscribers' tokens or emails.
5. Once unsubscribed, exclude that record from `/api/admin/newsletter/sync`
   (only "pending" records are retried) so they are never re-added.

## Privacy notes

- Subscriber emails are never exposed via any public endpoint.
- `GET /api/newsletter` and the `/api/admin/newsletter/*` endpoints require
  the `ADMIN_API_KEY` secret and are not reachable from the public website.
- The backend does not log subscriber email addresses, Google API errors are
  logged without the email, and API responses never include raw Google
  error details, credentials, or stack traces.
- Rate limiting (10 requests/minute per IP) and a client-side honeypot field
  reduce automated spam signups.
