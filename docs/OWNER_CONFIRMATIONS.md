# Owner confirmations: business information

_Created 2026-10-19. **Nothing in this file has been published.** Proposed wording is only applied to the site after the owner approves it, item by item._

Every statement below is currently live on the GitHub Pages preview and will go to production unless changed. For a childcare provider these are trust, safeguarding and possibly regulatory statements, so each needs a yes, a correction, or approval of the neutral alternative.

How to respond: for each row, reply **Confirm**, **Correct → "…"**, or **Use proposed**.

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
