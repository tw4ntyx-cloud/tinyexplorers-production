# Proposal: daily enquiry summary email + spreadsheet (CSV) export

_Status: **proposal only, not implemented.** Implementation needs owner approval and then the normal staging and deploy route (`docs/deployment/cloud-run-staging-plan.md`). Prepared 2026-10-19._

## Why

The owner expects **10–50 enquiries a week** and is happy with email for launch (questionnaire Q27–28). Today every admissions, enrollment or inquiry submission sends one staff email. If that email fails to send (Resend outage, 10-second timeout) or is missed (spam, busy inbox), the enquiry still sits safely in the database, but **nobody at the nursery can see it** without a developer. A once-a-day summary closes that gap. A CSV gives staff a spreadsheet they can sort, filter and keep for follow-ups, without a dashboard.

## What staff would get

**1. Daily summary email**, sent to `hello@tinyexplorersbda.com` at 7:00 AM Bermuda time:

```
Subject: Tiny Explorers — 3 new enquiries (Mon 20 Oct)

Admissions requests   1
Program enrollments   1
General inquiries     1
Newsletter sign-ups   4   (count only)

ADMISSIONS
• 19 Oct 14:02  Jamie Smith  jamie@…  Prefers: email  Child: 2 yrs  Program: Toddler
  "Looking for a September start…"

⚠ 1 notification email could not be sent yesterday. It is included above.

Full details: attached spreadsheet (enquiries-2026-10-19.csv)
```

- Covers everything submitted in the previous 24 hours, including any whose individual notification email failed. Those are flagged.
- **On days with no enquiries** the email is either skipped, or says "No new enquiries" so staff know the system is alive. Owner's choice; recommended: send it.

**2. CSV attachment** with the same 24 hours of enquiries. It opens in Excel, Numbers or Google Sheets.
- Columns: received (Bermuda time), type, reference ID, parent name, email, phone, preferred contact, child name, child age, program, start timing, message.
- Newsletter sign-ups are **counts only** (no addresses), to keep the email lighter on personal data.

**3. Full export on request** (developer tool): an admin-only download of all enquiries, or a date range, as CSV. It is used for privacy requests (PIPA) and record keeping. It runs with the existing admin key; there is no public link.

## How it would work

```
Cloud Scheduler (daily 07:00, time zone Atlantic/Bermuda)
   └─► POST /api/admin/digest   (authenticated, see below)
          ├─ read enquiries since the last successful digest (MongoDB)
          ├─ build summary + CSV
          ├─ send via Resend to ADMIN_EMAIL
          └─ record the run in `digest_runs` (so nothing is missed or sent twice)
GET /api/admin/export.csv?from=&to=&type=   (admin key; developer use)
```

**Authentication:** Cloud Scheduler calls the endpoint with a Google-signed identity token (OIDC) from a dedicated service account, and the API verifies it. A static key is avoided. The existing `X-Admin-Key` keeps working for the developer export.

**Missed days:** the window is "since the last successful run", not a fixed 24 hours. If a run fails, the next one includes everything.

**Notification status:** each submission records whether its individual email was sent. This is a small change to how submissions are saved, and it is what lets the summary flag failures.

## Privacy and security

- The summary contains the same personal data as today's notification emails, sent to the same single staff address. It is not new exposure, but it is a second copy. The CSV attachment adds a file that may be saved locally. **Alternative:** a summary without the attachment, plus the CSV on request.
- **CSV safety:** values that begin with `=`, `+`, `-` or `@` are prefixed so spreadsheets can't run them as formulas. Free-text messages are quoted.
- **Retention:** the 6-month retention the owner chose should also cover saved CSVs. Staff guidance: delete downloaded CSVs after follow-up. The automatic database clean-up stays **out of scope** until separately approved.
- The privacy policy may need one line noting that enquiries are summarised to staff by email. This needs a legal or PIPA check, together with the other privacy items.

## Effort and cost

| Piece | Effort |
|---|---|
| Digest endpoint, summary formatting, CSV builder (with formula-injection guard), run tracking | ~0.5 day |
| Record notification success per submission; flag failures | ~0.25 day |
| Admin CSV export endpoint | ~0.25 day |
| Tests (time windows, empty days, failures, CSV escaping, auth) | ~0.25 day |
| Cloud Scheduler job + service account (owner clicks, documented) | ~0.25 day |
| **Total** | **~1.5 days**, plus deployment through the staging plan |

Running cost: Cloud Scheduler includes a few free jobs per month. Resend usage goes up by one email a day.

## Decisions needed before building

1. Send the summary on days with no enquiries? (Recommended: yes.)
2. CSV attached daily, or summary only with the CSV on request? (Recommended: attached.)
3. Recipient: `hello@tinyexplorersbda.com` only, or also another person?
4. Send time (proposed 7:00 AM Bermuda time).
5. Include newsletter sign-ups as counts only? (Recommended: yes.)

## Dependencies

- Must ship **after** the Milestone 1 backend has been deployed through the zero-traffic staging plan. That is currently blocked by Atlas access (C1).
- Its test plan reuses `docs/deployment/smoke-test.sh` plus a manual trigger of the scheduler job against the staging revision.
