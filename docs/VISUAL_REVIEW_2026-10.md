# Visual and usability review (2026-10-19)

_Observations only. **Nothing has been redesigned.** Brand colours, logo, typography and copy are unchanged. Each item needs owner approval before any change._

## How this was checked

- Branch `claude/trusting-ramanujan-v9r2or`, run locally in safe preview mode (`.devcontainer/start-preview.sh`).
- Chromium at desktop 1440×900, tablet 834×1112 and mobile 390×844.
- Every route was visited, sections scrolled into view, every modal opened, and every form submitted with `TEST` data to the local in-memory backend. No production systems were contacted.

**Limitation:** the audit sandbox cannot load the Unsplash/Pexels stock photos, so photo areas appear as blank shapes in the screenshots. Composition with real images should be re-checked in a Codespace or on the Pages preview.

## What works well

- Consistent visual system: cream/orange palette, Poppins headings with DM Sans body, generous spacing, soft "splat" image frames.
- No horizontal overflow or clipped text on any page at any of the three widths (after fix H1).
- Modals are accessible: Esc closes, focus returns to the trigger, labelled fields, inline errors, success states.
- The mobile menu opens, the dropdown sections expand, and the menu closes after navigating.
- Reduced-motion preference is respected: no infinite animations run.
- Skip-to-content link; one `<h1>` per page; per-page titles; a 404 page with `noindex`.
- All four forms submit and show clear confirmations. Duplicate newsletter signups get a friendly "already on our list".

## Improvement opportunities (not applied)

| # | Observation | Where | Suggested direction | Effort |
|---|---|---|---|---|
| V1 | **Homepage order:** "Parent information & policies" is the 2nd section, ahead of "Why families choose us" and the **Programs** section, which sits about 4,400px down on desktop | Home | Move Programs up, directly after the hero; move Policies near the footer or to the Parents page | XS |
| V2 | **Too many call-to-action variants** leading to 3 overlapping forms: "Start Enrollment", "Inquire about a program", "Start an inquiry", "Begin admissions", "Start enrollment inquiry", "Book a Tour", "Schedule a Tour", "Book a campus tour", "Speak with our care team" | Site-wide | Settle on 2–3 consistent actions, e.g. **Book a tour**, **Apply / Start admissions**, **Ask a question**. Consider merging the enrollment and admissions forms. | S (copy) – M (forms) |
| V3 | **Very long pages:** homepage about 13,000px on desktop and about 18,500px on mobile (≈22 screens). The 8-card "day rhythm" timeline alone is about 2,700px | Home | Shorten the day rhythm to 4–5 moments or a compact horizontal timeline; trim repeated CTA blocks | S |
| V4 | Day-rhythm timeline on desktop leaves a wide empty left column (the line sits far left, the cards far right) | Home | Centre the timeline or use a two-column layout | XS |
| V5 | **Mobile header is 102px tall** (≈12% of the screen) because the full name wraps to two lines plus the tagline | Mobile, all pages | Shorter wordmark or hide the tagline on small screens | XS |
| V6 | **Small tap targets (20–23px tall):** header email link, program "Learn more", footer Privacy/Accessibility, nav "Book a Tour" | Site-wide | Increase to ≥24px (WCAG 2.2 AA 2.5.8; 44px recommended on touch) | XS |
| V7 | Gallery grid leaves an orphan tile and uneven gaps (needs re-checking with real photos) | Home → "Moments from our week" | Balanced 2×3 or 3×2 grid | XS |
| V8 | "Built with intention" quote card shows a large quote icon **and** a stray small `"` character | Home | Remove the duplicate glyph | XS |
| V9 | Tour booking leaves the site in the same tab (Google Calendar) | Tour modal | Open in a new tab with "opens Google Calendar" hint, or embed the scheduler | XS |
| V10 | Hero badge "1:4 Industry-leading ratio" and "100% certified staff" stats are prominent but unverified (see OWNER_CONFIRMATIONS A3/B3) | Home | Depends on owner answers | XS |
| V11 | The tablet layout (834px) uses the mobile single column with large empty areas beside the hero shapes | Tablet | Two-column hero from 768px | S |

## Suggested order, if approved

1. Content-safe quick wins with no visual identity change: V6, V8, V9, V5.
2. Structure: V1, V2 (copy only), V4.
3. After real photos arrive: V7, V11, and a full Lighthouse/axe pass.
