# Newsletter → Google Workspace Group: current state & remaining setup

This document describes how the "Subscribe" form on the website connects to
the `Tiny Explorers Newsletter` Google Group (`newsletter@tinyexplorersbda.com`),
and exactly what is **not** yet automated.

## What is implemented today

```
Website (Footer subscribe form)
   ↓ POST /api/newsletter  (validated, rate-limited, trimmed + lowercased email)
Backend (FastAPI, backend/server.py)
   ↓
Database "newsletter" collection (MongoDB)
   - id, email, status ("pending"), created_at, updated_at
   ↓
Admin reviews subscribers via GET /api/newsletter
   (requires the X-Admin-Key header / ADMIN_API_KEY secret — never public)
```

Every subscription request is stored with `status: "pending"`. There is
**no code path that automatically adds an email to the Google Group** —
this is intentional, because doing so would require Google Workspace
Admin SDK credentials (a service account with domain-wide delegation and
the `admin.directory.group.member` scope) which are not present in this
repository and must never be placed in frontend/client-side code.

## What an authorized admin must still do

Until Google Workspace automation is configured, an administrator with
access to the Google Workspace Admin Console must periodically:

1. Call `GET /api/newsletter` with the `X-Admin-Key` header (the shared
   secret configured via the `ADMIN_API_KEY` environment variable) to see
   pending subscribers.
2. Manually add approved email addresses to the **Tiny Explorers
   Newsletter** group (`newsletter@tinyexplorersbda.com`) via
   [Google Admin Console → Groups](https://admin.google.com/ac/groups).
3. (Optional/manual for now) Update the subscriber's `status` in the
   database from `pending` to `subscribed` once added to the group.

## To fully automate Google Group membership later

If/when Google Workspace API access is available, the following
server-side (never client-side) pieces would need to be added:

1. **Google Cloud service account** with domain-wide delegation, scoped to
   `https://www.googleapis.com/auth/admin.directory.group.member`, created
   by a Workspace super admin.
2. Store the service-account JSON as a secret environment variable on the
   backend host (e.g. Render), never committed to the repo or shipped to
   the browser.
3. A backend job (e.g. a scheduled task or triggered on subscribe) that
   uses the Admin SDK Directory API `Members.insert` call to add the
   subscriber's email to `newsletter@tinyexplorersbda.com`, then updates
   the subscriber's `status` to `"subscribed"`.
4. Error handling/retry for cases where the Admin SDK call fails (e.g.
   already a member, rate limits).

None of this is implemented yet — no credentials exist in this codebase,
and none should be added without a Workspace admin provisioning them
through a secure secret store.

## Privacy notes

- Subscriber emails are never exposed via any public endpoint.
- `GET /api/newsletter` requires the `ADMIN_API_KEY` secret and is not
  reachable from the public website.
- The backend does not log subscriber email addresses.
- Rate limiting (10 requests/minute per IP) and a client-side honeypot
  field reduce automated spam signups.
