# End-of-day handover: 19 October 2026

**Branch:** `claude/trusting-ramanujan-v9r2or` (pushed). **Not merged, not deployed.**

The following are all unchanged:
- `main`;
- the GitHub Pages preview;
- Cloud Run (revision `tinyexplorers-production-00021-9s9`);
- Secret Manager;
- the database;
- DNS.

## 1. Completed today

| Area | Change |
|---|---|
| Round-2 owner answers | Applied and verified on every page; retired claims are guarded by `frontend/src/data/ownerConfirmations.test.js`. The privacy policy is identical on the website, in the PDF (v1.1) and in the DOCX. "Approved by" stays **Pending sign-off**. |
| Retention | `backend/retention.py`: dry-run by default, deletion switch off, capped at 200 per run, protected statuses, audit log of ids and counts only. Admin-only endpoint; **not scheduled**. The design and audit are in `docs/RETENTION_DESIGN.md`. **The current wording cannot yet be met: launch blocker C6**, with replacement wording proposed. |
| Security | `docs/security/SECURITY_STATUS.md`. A history scan found **one** real credential (commit `ba4f124`). Only Cloud Run depends on it. Recovery: `atlas-access-recovery.md`. Rotation: `2026-10-mongodb-credential-exposure.md`. Visibility recommendation: make the repository private, after deciding on the Pages preview. Nothing was rotated or changed. |
| Policy DOCX | The 11 incomplete stubs were archived, not deleted (`docs/policies/archive/original-docx-stubs/`). Complete copies of all 12 policies are in `docs/policies/docx/`. The public site serves PDFs only. |
| Daily summary | `backend/digest.py`: first name and reference only; no contact details, child names or messages. Samples in `docs/digest/`. **Not scheduled, not sent.** |
| Search indexing | Robots meta set per build (`noindex, nofollow`); CI and Pages-deploy guards. It takes effect only on an approved merge. Plan: `docs/deployment/PREVIEW_NOINDEX_PLAN.md`. |
| Preview review | Navigation, 11 cross-page anchors, all 12 policy pages and PDF downloads, and all 4 forms (admissions, programme enquiry, newsletter, general enquiry) were checked; all pass. No app console errors. No clipping on 9 pages × 3 sizes. axe: only colour contrast of the brand orange on small text (not changed; owner question 15). External photos could not be loaded from the sandbox, so they are **unverified here**. |

## 2. Tests and results (run 19 Oct 2026, on this branch)

| Check | Result |
|---|---|
| Frontend unit tests | **43 / 43 passed** |
| Frontend production build | Compiled successfully; robots `noindex, nofollow`; 0 unfilled placeholders |
| Backend unit tests | **91 / 91 passed** |
| Backend live API tests (local server, in-memory) | **22 / 22 passed** |
| `pip-audit` (backend) | No known vulnerabilities |
| Browser walk: 9 pages × desktop 1440 / tablet 834 / mobile 390 | No clipping or page errors |
| axe-core WCAG 2 A/AA | One rule: `color-contrast` (brand orange) |

## 3. Files changed today (main ones)

- **Backend:** `backend/retention.py`, `backend/digest.py`, `backend/server.py` (retention endpoint, in-memory `delete_many`/`$in`), `backend/tests/test_retention.py`, `backend/tests/test_digest.py`, `backend/.env.example`.
- **Frontend:** `frontend/public/index.html`, `frontend/.env.production`, `frontend/.env.development`, `frontend/src/data/*`, `frontend/scripts/policy-docs/*`, `frontend/public/policies-docs/` (PDFs only).
- **Workflows:** `.github/workflows/ci.yml`, `.github/workflows/deploy-gh-pages.yml`.
- **Docs:**
  - `docs/RETENTION_DESIGN.md`, `docs/security/SECURITY_STATUS.md`, `docs/deployment/PREVIEW_NOINDEX_PLAN.md`;
  - `docs/OWNER_CONFIRMATIONS.md`, `docs/OWNER_QUESTIONNAIRE_FINAL.md`, `docs/ENQUIRY_DIGEST_PROPOSAL.md`;
  - `docs/policies/docx/`, `docs/policies/archive/`;
  - `PRODUCTION_READINESS.md`, `DEVELOPMENT_ROADMAP.md`, `DEVELOPMENT_HANDOFF.md`, `CHANGELOG.md`.

## 4. Pending approvals (nothing below has been done)

1. Merge to `main`. **This auto-deploys the backend at 100%**, so follow `docs/deployment/cloud-run-staging-plan.md`.
2. Credential rotation (C1), step by step. Blocked on Atlas sign-in.
3. Repository visibility → private, after the preview decision. Enable secret scanning and push protection.
4. Old preview: take offline, or keep with noindex.
5. Retention: wording, definition of "did not enrol", report-only runs. Real deletion needs a later, separate approval.
6. Daily summary: schedule and recipient.
7. Colour-contrast adjustment (owner question 15).

## 5. Security and privacy blockers

- **C1 (critical):** an exposed database credential sits in public Git history and has not been rotated. Atlas sign-in is failing. The repository's docs also point to the commit, so rotation is the real fix.
- **C6:** the retention wording is not yet achievable.
- **O2/O3:** no privacy contact; no PIPA review.
- **O1:** the privacy policy signatory is not named.

## 6. Document work

- The Owner Review Package (Documents 01–05, fillable PDFs, DOCX, combined packet, README, ZIP) was generated and validated: 126 form fields, none pre-filled, US Letter.
- It is **delivered privately and not committed**, because the repository is public.
- **Send now:** 05 (cover), 01, 02 and 03.
- **Keep:** 04, Launch Authorization, which is NOT YET APPROVED.

## 7. Preview instructions

Codespaces (recommended):
1. Open the branch in a codespace. The safe preview starts automatically: no database, email or Workspace access.
2. Open the forwarded port **3000** (keep it private).

Locally: `.devcontainer/start-preview.sh`, then http://localhost:3000.

## 8. Next steps

1. The owner returns Documents 01–03. Apply the answers on the branch: drill wording, signatory, privacy contact, retention wording.
2. Recover Atlas access, then run the rotation runbook one step at a time.
3. Run the zero-traffic staging revision, then a merge with approval.
4. Domain cutover (C3) with `REACT_APP_ROBOTS=index, follow` on production only.
5. Final launch review: update Document 04 and send it to the owners for signature.
