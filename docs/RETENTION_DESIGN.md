# Six-month enquiry retention: audit and design

_Prepared 2026-10-19. **Status: supporting code on the development branch; automatic deletion NOT activated, NOT scheduled, NOT deployed.**_

Approved privacy-policy wording (POL-010 v1.1, owner-approved 19 Oct 2026):

> "Enquiries from families who do not enrol are deleted six months after they are received."

## 1. Where enquiry data lives today (audit)

| Place | What | Who controls deletion | Covered by the job? |
|---|---|---|---|
| MongoDB `admissions` | Admissions requests: parent name, email, preferred contact, child name and age, start timing, "what matters most", program | This app | **Yes** |
| MongoDB `enrollment` | Program enquiry ("Start an enrollment inquiry"): parent, email, phone, child age, program, start date, message. **This is an enquiry, not an actual enrolment.** | This app | **Yes** |
| MongoDB `inquiry` | General inquiry: parent, email, phone (if phone/text chosen), child age, contact method, message | This app | **Yes** |
| MongoDB `newsletter` | Email address, status | This app | **No.** It has its own rule: kept while subscribed. |
| Staff mailbox `hello@tinyexplorersbda.com` | One notification email per enquiry, with all the details above | Nursery staff (Google Workspace) | **No.** Needs a mailbox rule or manual deletion. |
| Parent's own mailbox | Confirmation email sent to the parent | The parent | No (their copy) |
| Resend (email provider) | Sent-message logs and content, kept for a limited period set by Resend's plan | Resend account settings | No. Check the account's retention setting. |
| MongoDB Atlas backups | Snapshots containing deleted records until each snapshot expires | Atlas backup policy (tier dependent; **unknown until Atlas access is recovered**) | No; expires on its own schedule |
| Cloud Run request logs | URLs, timestamps, IP addresses. **No form contents** (verified: app logs mask emails and never log form bodies) | Google Cloud log retention (default 30 days) | No |
| Future daily summary email | Proposed to contain minimal details (see `docs/ENQUIRY_DIGEST_PROPOSAL.md`) | Nursery staff | No |

## 2. How enrolled families are told apart today

**They aren't.** Every enquiry record has a `status` field, but it is set to `"new"` when the record is created, and nothing in the system ever changes it. There is no admin screen, and enrolment happens offline. A "run everything older than six months" job would therefore also delete the enquiries of families who did enrol.

## 3. Missing pieces and decisions

| # | Gap | Needed from | Proposed default |
|---|---|---|---|
| R1 | **Definition of "does not enrol"** | Owner | Staff mark each enquiry as enrolled or not proceeding, **or** the owner accepts "no enrolment recorded within six months = not enrolling" |
| R2 | **How staff record the outcome** | Owner, then development | A small staff action (part of the admin view, or a status link in the daily summary) setting `status` to `enrolled`, `not_enrolling` or `closed` |
| R3 | **When the clock starts** | Owner (the wording says "received") | Date the enquiry is received (`created_at`) |
| R4 | What happens to enrolled families' website enquiries | Owner | Keep only until copied into the child's enrolment file, then delete. Or keep under the enrolment-records policy. |
| R5 | Staff mailbox copies | Owner | Mailbox rule or monthly manual clean-up of notification emails older than six months |
| R6 | Backup expiry period | Atlas access (blocked) | Confirm the snapshot retention. Wording must allow for it. |
| R7 | Other legal retention duties (complaints, safeguarding, mandatory reporting) | Owner + legal (PIPA review) | Any record under such a duty gets `retention_hold: true`, which the job never deletes |
| R8 | Authorisation to switch on automatic deletion | Owner | Only after two clean monthly dry runs reviewed by the owner |

## 4. Job design (implemented on the branch: `backend/retention.py`)

- **Scope:** `admissions`, `enrollment` and `inquiry` only; `newsletter` is never touched.
- **Eligible for deletion only if all are true:**
  1. received (`created_at`) more than six calendar months ago;
  2. status explicitly marks non-enrolment (`not_enrolling` or `closed` by default; configurable);
  3. not protected: status `enrolled`, `retain` or `legal_hold`, or `retention_hold: true`. These can **never** be made eligible by configuration.
  4. the date is readable. Records with unreadable dates are skipped and reported, never guessed.
- **Safeguards:**
  - **Dry run is the default.** It reports counts by collection and status, plus the record ids that would be deleted.
  - A real run additionally needs the `RETENTION_DELETE_ENABLED=true` environment setting, which is off by default.
  - Hard cap per run (`RETENTION_MAX_DELETE`, default 200). Above it, nothing is deleted and the outcome is `blocked_over_limit`.
  - Every run (dry or real) writes an audit entry to `retention_runs`: run id, time, cutoff, eligible ids, deleted counts. **No names, emails or messages** are logged or stored in the audit.
  - Only the `created_at` clock is supported; any other value is refused until the owner confirms R3.
- **Trigger:** admin-only `POST /api/admin/retention/run` (`{"dry_run": true}` by default). **Nothing schedules it.**
- **Tests:** `backend/tests/test_retention.py` (10 tests) cover:
  - month-end date maths;
  - classification;
  - dry runs deleting nothing;
  - blocking when disabled and when over the cap;
  - protected and recent records surviving;
  - the newsletter being untouched;
  - unreadable dates being skipped;
  - refusal of protected statuses as eligible;
  - the endpoint requiring the admin key.

### Proposed activation plan (each step needs approval)

1. Decide R1–R5 and R7. Build the staff "mark outcome" action (R2).
2. Deploy with deletion disabled. Use Cloud Scheduler to call the endpoint **monthly in dry-run mode** (1st of the month, 06:00 `Atlantic/Bermuda`, using a Google-signed identity token rather than a shared key).
3. The owner reviews two monthly dry-run reports.
4. With written owner authorisation, set `RETENTION_DELETE_ENABLED=true` and switch the scheduled call to `dry_run: false`.
5. Keep auditing monthly. Re-review whenever the privacy policy changes.

## 5. Is the current wording supportable? **Not yet: launch blocker**

The sentence promises deletion **six months after receipt**. Today:
- the system cannot tell who did not enrol (R1/R2);
- a monthly job deletes up to about one month after the six-month point;
- copies remain in the staff mailbox and in backups until those are cleaned up or expire.

**Proposed replacement wording (for owner approval; backup period to be filled in once known):**

> "If your family does not go on to enrol, we delete your website enquiry from our records within seven months of receiving it. Copies in our email and in our secure backups are removed as part of our regular clean-up, and backups expire automatically within [backup retention period]."

Alternative if the owner prefers to keep "six months": implement **daily** instead of monthly runs, and add a staff mailbox rule. The backup caveat is still needed.

Until the wording is approved, or the system matches it, **the privacy policy should not be published as-is**. This is recorded as a launch blocker in `PRODUCTION_READINESS.md`.
