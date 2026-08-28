# Newsletter → Google Workspace Group

This document describes how the website's "Subscribe" form connects to the
**Tiny Explorers Newsletter** Google Group (`newsletter@tinyexplorersbda.com`),
what is implemented in code today, and the exact steps a Google Workspace
administrator must complete to turn on automatic membership sync.

> No Google Workspace credentials exist anywhere in this repository. Nothing
> below has been "configured" or "verified" by an AI agent — it only becomes
> active once a human admin completes the setup steps and sets the resulting
> secrets on the backend host.

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

## What is NOT implemented yet

- **No credentials are configured.** `GOOGLE_SERVICE_ACCOUNT_JSON`,
  `GOOGLE_WORKSPACE_ADMIN_EMAIL`, and `GOOGLE_NEWSLETTER_GROUP_EMAIL` are all
  unset by default. Until an admin sets them, every subscriber lands as
  `status: "pending"` and `POST /api/admin/newsletter/sync` is a safe no-op.
- **No scheduled job runs the sync automatically.** `POST
  /api/admin/newsletter/sync` must currently be triggered manually (e.g. by
  an admin, or a cron/Render Cron Job once one is set up) — the endpoint was
  written so a scheduler can call it later without any code changes.
- **No public self-service unsubscribe endpoint.** There is only an
  admin-gated `POST /api/admin/newsletter/unsubscribe` for staff to use in
  the interim. See "Recommended secure unsubscribe workflow" below for what
  to build before ever exposing unsubscribe publicly.

---

## Step-by-step setup guide (for the Google Workspace administrator)

This assumes you have never configured the Google Admin SDK before, and that
you have **Super Admin** (or an admin role that can manage API access +
groups) on the `tinyexplorersbda.com` Workspace.

### 1. Create (or choose) a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (e.g. "Tiny Explorers Newsletter") or reuse an
   existing one dedicated to Tiny Explorers infrastructure.

### 2. Enable the Admin SDK API

1. In the Cloud Console, go to **APIs & Services → Library**.
2. Search for **Admin SDK API** and click **Enable** for your project.

### 3. Create a service account

1. Go to **APIs & Services → Credentials → Create Credentials → Service account**.
2. Give it a clear name, e.g. `newsletter-group-sync`.
3. You do **not** need to grant it any IAM roles on the project itself — its
   permissions come entirely from Workspace domain-wide delegation (step 5).
4. After creation, open the service account, go to the **Keys** tab, and
   **Add key → Create new key → JSON**. Download the JSON file and store it
   somewhere secure (a password manager or your hosting provider's secret
   store) — **never commit it to git or paste it into chat/docs**.

### 4. Find the service account's Client ID

1. Open the service account's **Details** tab in the Cloud Console.
2. Copy the **Unique ID** (a long numeric string) — this is the "Client ID"
   you'll need in the next step. (Not the email address.)

### 5. Configure domain-wide delegation in the Google Admin Console

1. Go to [admin.google.com](https://admin.google.com) → **Security → Access
   and data control → API controls → Domain-wide delegation**.
2. Click **Add new**.
3. Paste the service account's **Client ID** from step 4.
4. Under **OAuth scopes**, enter exactly this (minimum necessary scope —
   nothing broader):
   ```
   https://www.googleapis.com/auth/admin.directory.group.member
   ```
5. Save.

### 6. Choose the Workspace admin account to impersonate

Domain-wide delegation requires the service account to act *as* a real
Workspace user with permission to manage group membership (a super admin, or
an admin with the "Groups" privilege). Note that user's email address — this
is `GOOGLE_WORKSPACE_ADMIN_EMAIL`. Do not use a personal account; use a role
account if one exists (e.g. `it-admin@tinyexplorersbda.com`).

### 7. Set the backend environment variables

On whichever host runs `backend/` in production (see also the hosting
recommendation in the main implementation report), set these as **secret**
environment variables — never in a committed `.env` file:

| Variable | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | The **entire contents** of the JSON key file from step 3, as a single-line string |
| `GOOGLE_WORKSPACE_ADMIN_EMAIL` | The admin account chosen in step 6 |
| `GOOGLE_NEWSLETTER_GROUP_EMAIL` | `newsletter@tinyexplorersbda.com` |

If deploying on Render, add these under the service's **Environment**
settings (they're already declared as `sync: false` placeholders in
`render.yaml` so Render will prompt for them without storing a default).

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

1. Temporarily set `GOOGLE_NEWSLETTER_GROUP_EMAIL` to an invalid group
   address (or briefly revoke the domain-wide delegation scope) and restart.
2. Submit a new test subscription — confirm it's stored with
   `status: "pending"` and no error is shown to the visitor.
3. Restore the correct configuration and restart.
4. Call `POST /api/admin/newsletter/sync` with `X-Admin-Key` — confirm the
   test subscriber flips to `status: "subscribed"` and the group now
   contains them.

### 12. Credential rotation / revocation

- To rotate: create a new key on the same service account (step 3), update
  `GOOGLE_SERVICE_ACCOUNT_JSON` on the backend host, redeploy, then delete
  the old key from the service account's **Keys** tab in Cloud Console.
- To revoke immediately (e.g. suspected leak): delete the domain-wide
  delegation entry in the Admin Console (step 5) and/or delete the service
  account entirely — this instantly stops it from being able to call the
  Admin SDK, independent of whether the JSON key file was rotated yet.
- Treat the JSON key file with the same care as a database password: store
  it in a secrets manager or your host's encrypted environment variable
  store, never in source control, chat, or shared documents.

---

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
