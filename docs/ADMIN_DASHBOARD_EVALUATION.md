# Does Tiny Explorers need a staff admin dashboard before launch?

_Evaluation 2026-10-19. Recommendation only; nothing has been built._

## How staff see submissions today

| Submission | Stored in MongoDB | Staff email to `ADMIN_EMAIL` | Parent confirmation | Other way for staff to see it |
|---|---|---|---|---|
| Admissions request | ✅ | ✅ | ✅ | `GET /api/admissions` with `X-Admin-Key` (developer only) |
| Program enrollment inquiry | ✅ | ✅ | ✅ | `GET /api/enrollment` (developer only) |
| General inquiry | ✅ | ✅ (now includes phone) | ✅ | `GET /api/inquiry` (developer only) |
| Newsletter signup | ✅ | ❌ (by design) | ✅ welcome email | Google Group membership (if Workspace sync is configured); `GET /api/newsletter` |

Facts that matter for the decision:
- `tinyexplorers-admin` is an **empty repo**. The GCP project is named `tiny-explorers-staff-portal`, which suggests a portal was planned, but no code exists.
- **Email is the only staff-facing channel.** If an email is not delivered, the submission is still saved, but staff cannot see it without a developer. That can happen through a Resend outage, the email landing in spam, or the 10-second timeout.
- There is no status tracking ("contacted", "toured", "enrolled"), no notes, and no export.
- There is also no deletion workflow for privacy requests (PIPA). Deletions today would mean editing Atlas by hand.
- Admin API listing is capped at 500 rows with no pagination. That is fine for the first year at expected volume.

## Options

| Option | What staff get | Effort | Risk / notes |
|---|---|---|---|
| **A. Email only (status quo)** | Notification per submission | 0 | Silent loss if an email isn't seen; no tracking; privacy deletions need a developer |
| **B. Email + safety net** (recommended minimum for launch) | As A, plus a **daily digest email** listing all new submissions (catches missed or failed emails), plus a developer **CSV export script** for privacy requests and records | ~1 day | No UI; digest needs Cloud Scheduler → admin endpoint |
| **C. Read-only staff dashboard** | Login; one list per form type with search; CSV export; newsletter sync/unsubscribe buttons | 2–4 days | Needs real staff authentication (e.g. Google sign-in restricted to `@tinyexplorersbda.com`, checked server-side). **Never** put `ADMIN_API_KEY` in browser code. |
| **D. Full enquiry tracking** | C, plus status workflow (new → contacted → toured → enrolled/closed), notes, assignment, delete/anonymise, audit log | +2–3 days on top of C | Turns the site into a small CRM. Consider whether a spreadsheet or CRM integration fits better. |
| **E. Off-the-shelf** | Forward submissions to Google Sheets or an existing CRM | 1–2 days | Copies family PII into another system; needs a privacy-policy mention |

## Recommendation

**A dashboard is not a launch blocker. Launch with option B, and plan option C as the first post-launch milestone.** Upgrade to D only if the owner's questionnaire answers (Q27–28) show real volume or a need for tracking.

Why:
- At launch volume (likely under 10–50 enquiries a week for a single new nursery), email notifications work, provided delivery is **verified end to end in production** (staging plan V6–V7) and SPF/DKIM/DMARC are set up.
- Option B closes the one real gap, silent loss of an enquiry, for about a day of work, and gives a documented way to handle privacy requests.
- A proper dashboard needs proper authentication. Building it in a rush before launch is the riskiest way to expose family PII. Doing it right after launch, with real usage to guide it, is safer.

**If the owner answers Q28 with "need a simple list/export", promote option C to before launch.** It is the smallest UI that is safe to build.

### Requirements to carry into any dashboard (C/D)

- Server-side authentication with an allow-list of staff emails. Session or ID-token verification in FastAPI. MFA via Google Workspace.
- New endpoints with pagination and filters; `PATCH` for status and notes; `DELETE` or anonymise for privacy requests; an audit log of admin actions.
- Separate CORS origin for the admin UI, kept off the public site's bundle; `noindex`.
- Host as a separate static site or behind Cloud Run with Identity-Aware Proxy (IAP) on the existing GCP project.
