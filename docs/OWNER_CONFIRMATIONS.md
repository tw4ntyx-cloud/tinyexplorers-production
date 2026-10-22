# Owner confirmations: business information

_Created 2026-10-19. **Nothing in this file has been published.** Proposed wording is only applied to the site after the owner approves it, item by item._

Every statement below is currently live on the GitHub Pages preview and will go to production unless changed. For a childcare provider these are trust, safeguarding and possibly regulatory statements, so each needs a yes, a correction, or approval of the neutral alternative.

How to respond: for each row, reply **Confirm**, **Correct → "…"**, or **Use proposed**.

## Owner decisions received 2026-10-19 (questionnaire), applied on branch `claude/trusting-ramanujan-v9r2or`

The changes are applied on the branch only. **Not merged, not deployed.** Guarded by `frontend/src/data/ownerConfirmations.test.js`.

| Q | Owner answer | Applied as |
|---|---|---|
| 1, 3 | Address is **59 Victoria St, Hamilton**; show it **only after a tour is booked** | Site shows "Hamilton, Bermuda" (footer, hero, admissions). Tour details say the full address is in the booking confirmation. Street and postcode removed from the JSON-LD. "12 Reid Street" removed. **Owner action:** make sure the Google Calendar appointment schedule's *location* field contains 59 Victoria St, so confirmations include it. |
| 2 | Hamilton only | "Hamilton & Paget campuses" removed |
| 4 | Email only | Unchanged. The "Emergency phone" promise is removed (Parents page grid now 3 columns). |
| 5, 6 | Not open yet, no date; enrolling, no start date | "Now enrolling" (hero pill, CTA), "Now enrolling our first families", "We're preparing to welcome our first families", "Opening soon". All "Fall 2026" wording removed. |
| 7, 8 | Hours, programmes and ages correct | Unchanged |
| 9 | Per-programme ratios correct | "1:4 industry-leading ratio" badge → "1:3 · Infant care ratio · Small groups by design". Environment stat "1 : 4" → "From 1 : 3 · Educator to child" |
| 10 | Lead educators certified; 2 first-aiders per classroom; annual safeguarding — but **not** "100% certified staff" | "100% Certified staff" stat → "2 · First-aiders per room". "Certified early-years teachers" → "Lead educators with early-years certification" |
| 11 | Nurse is real but must not be named | Name removed from the home card, Wellness card and pull-quote. Card shows "Registered Nurse · Bermuda licensed · available by appointment". Pull-quote attributed to "Tiny Explorers". |
| 12 | Medication only per the Medicine Policy | FAQ rewritten to match the policy: trained staff, signed Medication Authorization Form, original labelled packaging, for prescribed and over-the-counter medication. The old FAQ ("our nurse"; "doctor's note") contradicted the policy. |
| 13 | Therapists can be arranged on request | FAQ updated. The "family pediatricians on individual plans" claim is removed. |
| 14 | All security features true | Unchanged |
| 15 | 4,200 sq ft and south-facing rooms/lighting true; HEPA and paediatric architect **not** | "HEPA filtration" and "co-designed with … a pediatric architect" removed. Copy now mentions bright, south-facing rooms. |
| 16 | 30-minute sick-child call accurate | Unchanged |
| 17, 18 | Families send food; **fully nut-free** | "Allergen-aware kitchen with a nut-free zone" → "A fully nut-free nursery…". Nut-aware → nut-free. Homepage lunch card no longer implies the nursery serves "family-style", "seasonal" food. |
| 19 | Stock photos, without "our campus" wording | "Hamilton Campus" photo caption → "Room to explore". Gallery "Moments from our week" → "What a week can look like". Stock images otherwise unchanged. |
| 21 | Legal name "Tiny Explorers Bermuda Ltd." correct | Unchanged |
| 23 | Keep non-enrolling enquiries 6 months | Recorded. **Not yet implemented** (needs a deletion job and a privacy-policy sentence; see round 2). |
| 24 | Newsletter privacy text approved | Merged into the website's Privacy & Confidentiality Policy page and `docs/policies/privacy-confidentiality-policy.md`, contact `hello@tinyexplorersbda.com`. **The downloadable PDF/DOCX still need regenerating.** |
| 26–28 | Notifications to hello@ correct; 10–50/week; email enough | No dashboard before launch. The option-B safety net (daily digest and export) is still recommended given 10–50 enquiries a week. |
| 20, 22, 25 | Not answered / "n/a yet" / PIPA not reviewed | Open (round 2) |

## Round 2 answers received 2026-10-19, applied on branch (not merged, not deployed)

| # | Owner answer | Applied as |
|---|---|---|
| 1 | Registered with the Bermuda Ministry | Kept "Bermuda Ministry registered". Programs text now reads "…led by certified educators, and Tiny Explorers is registered with the Bermuda Ministry of Education". **Removed** "All below Bermuda Ministry minimums" (registration does not confirm the comparison). |
| 2 | "Est. 2026" correct | Unchanged |
| 3 | Front desk: not sure | Removed. "Secure entry" now lists keycard access, visitor log and CCTV (all confirmed in round 1). |
| 4 | Every-staff checks / certification / annual re-training: n/a | Removed. "Trained adults" now uses the round-1 confirmed facts: certified lead educators, 2 first-aiders per classroom, annual safeguarding training. |
| 5–6 | Fire, hurricane/shelter and lockdown drills are true; frequency not sure | "practiced regularly" on Parents and Wellness. **Note:** the nursery's own Fire & Emergency Evacuation Plan says drills are **monthly**. Owner to confirm the policy is right; if so, the site can say "monthly". |
| 7 | Languages: no / not sure | Multilingual claim removed. FAQ: "English is the main language of the classroom." |
| 8 | All three parent updates true | Unchanged |
| 9 | "No screens" is **not** correct | Philosophy bullet and FAQ now match the nursery's **Media Viewing Policy** (limited, age-appropriate, educational, content reviewed by staff) |
| 10 | Vaccinations: not sure | FAQ now quotes the **Enrollment Policy** (health and immunization records before the first day). Department of Health schedule and exemptions wording removed. |
| 11–12 | Privacy contact and PIPA reviewer: not sure yet | **Open, launch blocker** |
| 13 | Retention sentence approved | Added to the privacy policy (website, PDF, DOCX, markdown). **See operational note below.** |
| 14 | Sign-off by Owner or Director, on publication | **Name not provided.** The documents still say "Pending sign-off"; the name will be added when received. |
| 15 | Booking page location set to 59 Victoria St | Done; owner action closed |

**Operational note on retention (Q13):** the privacy policy now promises that non-enrolling enquiries are deleted after six months. Automatic deletion is **not** implemented (not approved). Before the policy is published, choose one:
- **(a)** approve the automatic monthly deletion job; or
- **(b)** adopt a documented manual monthly clean-up, run by someone with database access. This currently also depends on Atlas access.

Either way, the database records nothing yet about whether a family enrolled. "Non-enrolling" needs a definition, e.g. "no enrollment record within six months", or a status set by staff.

## Verification and open items (end of day 2026-10-19)

**Verified on the branch** (browser and automated checks):
- every round-1 and round-2 change renders on the pages;
- no retired claim remains (`ownerConfirmations.test.js`);
- the privacy policy is identical on the website, in the PDF and in the editable DOCX.

| # | Open item | Why it matters | Status |
|---|---|---|---|
| O1 | **Signatory name and title** for the privacy policy | Policy says "Approved by: Pending sign-off" until given | Open, in final questionnaire |
| O2 | **Privacy contact** (person or role, and address) | PIPA requires a named contact for privacy requests | **Launch blocker** |
| O3 | **PIPA review**: who reviews, and by when | Policy should be reviewed before families rely on it | **Launch blocker** |
| O4 | **Drill frequency**: the Fire & Emergency Evacuation Plan says **monthly** | Site says "practiced regularly" until confirmed | Open |
| O5 | **Definition of "does not enrol"**, and who records it | The system cannot tell enrolled families apart yet (`docs/RETENTION_DESIGN.md` §2) | **Launch blocker** (with O6) |
| O6 | **Retention wording**: "deleted six months after they are received" cannot yet be met (monthly job, mailbox copies, backups) | Promise to families must be accurate | **Launch blocker**. Replacement wording proposed in `RETENTION_DESIGN.md` §5 |
| O7 | Authorisation to switch on automatic deletion, after two reviewed dry runs | Irreversible | Not requested yet |
| O8 | Who holds the MongoDB Atlas login | Needed to rotate the leaked credential | **Critical security item** |

All of the above are collected in one short form: `docs/OWNER_QUESTIONNAIRE_FINAL.md`, and in the privately delivered Owner Review Package (Documents 01 and 02).

**Added 2026-10-22 (policy audit; asked in Owner Review Package v2.0):**

| # | Open item | Status |
|---|---|---|
| O9 | Licensing body and licence number: the website's "Ministry of Education" claim may be wrong | **Launch blocker** |
| O10 | Were the 11 v1.0 policies actually approved, and by whom? (A "Board of Governors" is printed; the sign-off blocks are blank.) | **Launch blocker** |
| O11 | Enrollment Policy age groups conflict with the website | **Launch blocker** |
| O12 | Roles named in the policies (Director, Complaints Officer, Child Protection Officer) | Open |
| O13 | Transport and water activities (mangrove paddles) advertised; no water-safety rules | Open |
| O14 | CCTV retention and access, for the privacy notice | Open |

## Round 2 — questions as sent (historical; answered above)

These claims are still on the site and were not covered by the questionnaire. They are unchanged until answered.

1. **"Bermuda Ministry registered"**: hero marquee and nurse card. Also "Every classroom is led by certified educators **with Bermuda Ministry of Education registration**" (Programs) and "All **below Bermuda Ministry minimums**" (ratio FAQ). Is the nursery registered or licensed with the Ministry yet, given it hasn't opened?
2. **"Est. 2026"** (hero): correct?
3. **Parents page safety list**: "Front desk staffed continuously"; "**Every** staff member background-checked, first-aid certified, re-trained annually" (you confirmed 2 first-aiders per classroom; is every staff member certified?); "Fire, hurricane, and lockdown drills run **termly**", while the Wellness page says "**Quarterly** fire and shelter drills". Which is right?
4. **Languages**: "Spanish, French, and Portuguese … from our multilingual educators". Accurate?
5. **Parent communication**: daily notes, weekly private photos, monthly one-to-ones. Accurate commitments?
6. **Other policies stated in FAQs**: no screens during the day; vaccinations required per the Bermuda Department of Health schedule. Accurate?
7. **Privacy contact** (Q22) and **PIPA review** (Q25). Needed before launch.
8. **6-month retention** (Q23). Approve adding this sentence to the privacy policy: *"Enquiries from families who do not enrol are deleted six months after they are received."* Also approve an automatic monthly clean-up job that deletes those records. That is irreversible, so it needs explicit approval.

## A. Contradictions found in the site itself (must resolve)

| # | Topic | What the site says now | Where | Why it needs attention | Proposed neutral wording |
|---|---|---|---|---|---|
| A1 | **Address** | "59 Victoria St, Hamilton, Bermuda" (hero location tag, tour location) **and** "12 Reid Street, Hamilton HM 11, Bermuda" (footer, search-engine data) | `content.js:136,164,896`, `index.html` JSON-LD | Two street addresses shown to families. Perhaps one is the campus and one is a mailing address? | Until confirmed: show "Hamilton, Bermuda" only, and "address shared when you book a tour". |
| A2 | **Campuses** | "Hamilton & Paget campuses" (site description); "Our Hamilton campus…"; "Hamilton Campus" caption | `content.js:158`, `Environment.jsx` | Is there a Paget campus? If not, the description is wrong. | "Our Hamilton home…" / remove "& Paget campuses". |
| A3 | **Ratios** | Homepage stat "1 : 4 Teacher to child" and badge "1:4 Industry-leading ratio"; Parents page "1:3 infant, 1:4 toddler, 1:6 preschool, 1:8 after-school" | `Hero.jsx`, `Environment.jsx`, `content.js:786-789,841` | A single 1:4 figure contradicts the per-program ratios. "Industry-leading" is an unsupported comparison. | Use only the per-program table once confirmed. Replace the badge with "Small groups by design". |
| A4 | **Food / kitchen** | "Families send lunches and snacks from home" **and** "Allergen-aware kitchen with a dedicated nut-free zone" | `content.js:606,630,821` | Is there a kitchen? Is the centre nut-free? | "Allergy-aware routines, with families' food plans respected." |

## B. Claims needing confirmation (no contradiction, but unverified)

| # | Topic | Current text | Where | Proposed neutral wording if unconfirmed |
|---|---|---|---|---|
| B1 | Operating hours | Mon–Fri 7:30 AM–6:00 PM; drop-off 7:30–9:00; pickup 3:30–6:00 | `content.js:776-778`, JSON-LD | "Weekday hours shared during your tour." Also remove hours from the JSON-LD. |
| B2 | Opening / enrollment dates | "Est. 2026", "Now enrolling · Fall 2026", "Opening Fall 2026", "We open our doors Fall 2026" | `content.js:159,171,183,300`, `CtaSection.jsx`, `Testimonial.jsx` | Fall 2026 has arrived. If already open: "Now enrolling". If not: "Opening soon. Join our list for dates." |
| B3 | Staff qualifications | "Certified early-years teachers"; "100% Certified staff"; "Two staff members trained in pediatric first aid in every classroom"; "Annual safeguarding training for every adult on campus" | `Features.jsx:30`, `Environment.jsx:33`, `content.js:628-629` | "Our educators are trained in early-childhood care, first aid and safeguarding." Use only if true; otherwise remove. |
| B4 | **Named staff member** | "Lena Trott, Registered Nurse · Bermuda licensed · Bermuda Ministry registered" (on-call nurse card) | `content.js:349-351`, `Wellness.jsx` | **Is this a real person who consented to being named?** If not, or unconfirmed: "Nurse guidance available to families by appointment." Remove the name and licence lines. |
| B5 | Nurse services | "An on-call nurse…"; "Prescribed medications can be administered by our nurse…" | `content.js:326,583,657` | Must match the Medicine Policy. If unconfirmed: "Medication is handled under our Medicine Policy." |
| B6 | Security features | "Keycard entry, monitored visitor log, and CCTV at every entrance"; "daily safety walkthroughs" | `content.js:626`, `Features.jsx:22` | "Secure, supervised entry and daily safety checks." |
| B7 | Facility | "4,200 square feet"; "4,200 sq ft of calm"; "South-facing rooms with circadian-aware lighting"; "HEPA filtration in every room"; "co-designed with … a pediatric architect" | `Environment.jsx`, `content.js:627` | "Calm, light-filled rooms designed for young children." Drop the figures until confirmed. |
| B8 | Programs and ages | Infant 6–18 mo, Toddler 18–36 mo, Preschool 3–5 y, After School 5–8 y | `content.js` | Confirm or correct. |
| B9 | Sick-child response | "We'll call you within thirty minutes…" | `content.js:659` | "We'll contact you promptly and care for your child until you arrive." |
| B10 | Emergency phone | "Emergency phone: direct line, answered by a real adult, during all operating hours" | `content.js:830` | No phone number is published, so this promise can't be fulfilled. Remove it until a number exists. |
| B11 | Additional needs | "We work closely with occupational therapists…" | `content.js:839` | "We welcome inquiries from every family and will talk through your child's needs with you." |
| B12 | Rating / testimonial (currently **hidden**) | "4.9 / 5 parent rating"; testimonial by "Maya Astwood" | `content.js:180,294,297` | Keep hidden. Before re-enabling, confirm it is a real, consenting parent. A rating is not possible before opening. |
| B13 | Quote attribution | Quote attributed to "Albert Einstein" (Philosophy page) | `content.js:519-521` | Many popular quotes are misattributed. Verify the source, or drop the attribution. |
| B14 | Legal entity | "Tiny Explorers Bermuda Ltd." (privacy draft) | `docs/newsletter-privacy-update.md` | Confirm the registered name for the privacy policy. |
| B15 | Phone number | None published (deliberately) | `content.js:161` | Provide a number, or confirm email-only at launch. |

## C. Photography

All 15 photos on the site are stock images hotlinked from Unsplash/Pexels (`content.js` IMAGES, `index.html` social preview image). They are presented as the school's own spaces and children ("Our Hamilton campus…").

Options:
1. **Supply real photos.** Requires media consent for any identifiable child or staff member, matching your own Media & Photography Consent Policy. Recommended.
2. **Approve stock for launch.** Then soften the framing, e.g. "Spaces that whisper, not shout" without "Our Hamilton campus was…". Self-host the files rather than hotlinking them.
3. Mixed: real photos for facility shots, stock for decorative ones.

## D. Privacy policy requirements

The site collects names, emails, phone numbers, child names and ages, and free-text notes about children's needs (admissions, inquiry, enrollment and newsletter forms). It stores them in MongoDB Atlas and sends them by email via Resend; newsletter addresses also go to a Google Group.

Owner and legal decisions needed:
- Approve and merge the newsletter section (`docs/newsletter-privacy-update.md`; its 4 open questions are listed there).
- Add a section on **form submissions**: what is collected, why, who receives it (staff email), processors (MongoDB Atlas, Resend, Google), retention period, and how to request deletion.
- State a retention period for unsuccessful inquiries.
- Name a contact for privacy requests. This must use the `tinyexplorersbda.com` domain; the draft still says `tinyexplorers.bm`.
- Confirm whether Bermuda's Personal Information Protection Act (PIPA) obligations (e.g. a privacy officer) apply. This needs legal advice.

## E. Already decided (for reference)

- Contact email: `hello@tinyexplorersbda.com`. Resend sending domain verified (per commit `b7a05ac`).
- Tours: Google Calendar appointment schedule.
- No phone number published until verified.
