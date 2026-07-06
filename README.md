# Tiny Explorers

A premium Bermuda-based preschool and early childhood center.
Marketing site — modern, warm, editorial, Scandinavian/Montessori-inspired.

> **Apple meets a luxury Montessori preschool.**

---

## Stack

- **Frontend** — React 19 (CRA + craco), TailwindCSS 3.4, shadcn/ui (Radix), lucide-react, sonner, axios.
- **Backend** — FastAPI + Motor (async MongoDB).
- **Hosting target** — Vercel (frontend) + any Python host for the API (Render, Fly, Railway).

## Project structure

```
.
├── backend/                    FastAPI service (newsletter + enrollment endpoints)
│   ├── server.py
│   ├── requirements.txt
│   └── tests/
├── frontend/                   React app (the marketing site)
│   ├── public/
│   │   ├── index.html          SEO foundation: OG/Twitter cards, JSON-LD Preschool schema
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js              Single-route landing page
│   │   ├── index.css           Tailwind + design utilities + motion-safe guards
│   │   ├── components/
│   │   │   ├── Hero.jsx        Recomposed: hand-drawn splat frames, calmer composition
│   │   │   ├── Features.jsx    Stripped chrome — editorial blocks on cream
│   │   │   ├── Programs.jsx    Simplified — consolidated CTA, no urgency pills
│   │   │   ├── Environment.jsx Editorial split with display numeral
│   │   │   ├── Testimonial.jsx Single-quote (carousel = P2)
│   │   │   ├── CtaSection.jsx  Warmth pivot — cream invitation, not dark tech block
│   │   │   ├── Gallery.jsx     Clean photo edges, hover-only captions, keyboard a11y
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── EnrollmentModal.jsx
│   │   │   ├── decor/
│   │   │   │   └── Splat.jsx   Hand-drawn SVG splat frames + curated doodle library
│   │   │   └── ui/
│   │   │       ├── Section.jsx     Section/Container/Eyebrow/SectionHeader primitives
│   │   │       ├── SmartImage.jsx  CLS-safe image primitive
│   │   │       └── ...             shadcn/ui components
│   │   ├── data/
│   │   │   └── content.js      SINGLE SOURCE OF TRUTH for copy + image URLs
│   │   ├── hooks/
│   │   │   ├── useInView.js    IntersectionObserver hook for scroll-triggered fade-up
│   │   │   └── use-toast.js
│   │   └── lib/
│   │       ├── api.js
│   │       └── utils.js
│   ├── tailwind.config.js      Brand tokens + keyframes (marquee, pulse-soft, fade-up)
│   ├── craco.config.js
│   ├── package.json
│   └── .env.example
├── design_guidelines.json      Original brand spec
└── memory/PRD.md               Original PRD + sprint history
```

## Local development

### Prerequisites
- Node 18+ and Yarn (or npm)
- Python 3.11+ for backend
- MongoDB (local or Atlas) for backend

### Frontend

```bash
cd frontend
cp .env.example .env             # then edit REACT_APP_BACKEND_URL if needed
yarn install                     # or `npm install --legacy-peer-deps`
yarn start                       # http://localhost:3000
```

**Note on installation:** the repo declares `@emergentbase/visual-edits` as a dev dependency
hosted on an internal CDN. If you can't access that CDN, either remove the line from
`package.json` or run `npm install --legacy-peer-deps --ignore-scripts`.

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# .env needs: MONGO_URL, DB_NAME, CORS_ORIGINS
uvicorn server:app --reload --port 8000
```

API will be available at `http://localhost:8000/api`.

### Quick local dev (frontend + backend)

If you want to start both backend and frontend in a Codespace or local dev environment, from the repository root run:

```bash
# Start backend (uses workspace venv if present)
./backend/run.sh &

# Start frontend
cd frontend
npm install
npm run start
```

Or use the included helper which starts the backend then the frontend:

```bash
./run_dev.sh
```

Notes:
- Backend will use in-memory fallback storage when `MONGO_URL` is not set (safe for local development).
- Set `RESEND_API_KEY` in your environment to enable real email sending; otherwise email actions are logged.

---

## What's in this revision

This is the result of three improvement sprints against the original build, all
preserving the existing structure (no rewrite from scratch).

### Sprint 1 — Foundation
- **Shared layout primitives** — `<Section>`, `<Container>`, `<Eyebrow>`, `<SectionHeader>`
  (in `components/ui/Section.jsx`) — single editorial rhythm across the entire site.
- **Hand-drawn SVG splat library** (`components/decor/Splat.jsx`) — three irregular
  clip-path shapes (`splat-1` spiky-cloud, `splat-2` soft-flower, `splat-3` torn-paper)
  + six curated doodles (smile, curl, underline, burst, zigzag, dots).
- **Token cleanup** — refined `tailwind.config.js` (added `cream-deep`, `cream-soft`,
  `shadow-soft-xl`, `marquee-x` + `pulse-soft` keyframes, `transitionTimingFunction.soft`).
- **Reduced-motion guards** + accessible focus-visible rings in `index.css`.

### Sprint 2 — Visual recomposition
- **Hero** — replaced symmetric CSS blob masks with irregular hand-drawn splats;
  reduced ambient color glows from three blurred circles to a single warm radial;
  cut floating accents from 4 stars + 1 squiggle to 1 smile + 1 burst; moved
  "Now enrolling" pill above the headline (matching moodboard); retired loud
  `animate-ping` for `animate-pulse-soft`; marquee strip now actually animates.
- **CTA** — pivoted from `bg-brand-ink` dark tech-block to a warm cream invitation
  panel with a single child portrait clipped in a splat shape.
- **Hand-drawn doodle adoption** — curated placement (1–2 per section), not scattered.

### Sprint 3 — Polish + production-readiness
- **Features card chrome stripped** — moodboard-aligned editorial blocks on cream
  (no white cards, no `01/02` numerals, no sparkle ✦ badges, no hover progress bars).
- **Programs simplified** — removed "3 spots left" urgency pills, dark gradient
  scrim, and per-card CTA footers. Consolidated to one section-level CTA.
- **Gallery refined** — clean photo edges at rest, hover-only caption cards,
  keyboard-focusable `<button>` tiles ready to wire to a lightbox.
- **Image asset pipeline** — `data/content.js` is the single source of truth for
  copy + image URLs. `<SmartImage>` provides CLS-safe lazy/eager loading.
- **Scroll-triggered fade-up** — wired into the `<Section>` primitive itself via
  `hooks/useInView.js`; respects `prefers-reduced-motion`.
- **Production SEO** — `public/index.html` includes OG/Twitter cards, image-CDN
  preconnects, favicon/manifest slots, and a full JSON-LD `Preschool` schema
  with Bermuda address, phone, opening hours, and aggregate rating.
- **Stripped** — the Emergent dev badge, the `emergent-main.js` script, and the
  hardcoded PostHog tracker from `index.html`.

### Open backlog (for future sprints)

See `memory/PRD.md` for the original PRD + backlog. The remaining roadmap from
the latest audit:

**P2 (medium impact + production)**
- Testimonials → carousel of 3 (use installed `embla-carousel-react`).
- Gallery lightbox (use installed `@radix-ui/react-dialog`).
- Footer brand finale (map, campus photo strip, real anchor routes).
- Navigation scrollspy + body-scroll-lock on mobile menu.
- Refactor `EnrollmentModal` to `react-hook-form` + `zod` (both already installed).

**P3 (real launch readiness)**
- Migrate CRA → **Next.js 14 App Router** (CRA is in maintenance mode; for SEO
  + scalable routes like `/programs/[slug]`, `/about`, `/blog`).
- Backend hardening — replace deprecated `@app.on_event` with `lifespan`, add
  rate limiting (`slowapi`), email notifications (Resend/SendGrid), MongoDB
  unique indexes.
- Performance + a11y audit — Lighthouse target 95+/95/100/100.

---

## Brand reference

| Token | Hex |
|---|---|
| Cream (page) | `#FFF7EE` |
| Cream-soft | `#FCEFDD` |
| Cream-deep | `#F8ECDD` |
| Orange (primary accent) | `#FF6B2C` |
| Green | `#22C55E` |
| Blue | `#60A5FA` |
| Yellow | `#FBC247` |
| Surface | `#F1F1F1` |
| Ink (text) | `#1F1F1F` |

**Type:** Poppins (display) + DM Sans (body), loaded via Google Fonts in `index.html`.

---

## Deployment

### Frontend (Vercel)

The project is currently CRA. The easiest path:

1. Connect this repo to a new Vercel project, set the **root directory** to `frontend`.
2. Build command: `npm run build --legacy-peer-deps` (or remove the `@emergentbase/visual-edits` dep first).
3. Output directory: `build`.
4. Add env var `REACT_APP_BACKEND_URL` pointing to your deployed API.

**Recommended for next sprint:** migrate to Next.js for SSR + better SEO. The
component tree is already isolated from routing concerns and ports cleanly.

### Backend (Render / Fly / Railway)

Standard FastAPI + uvicorn deployment. Required env vars:

- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — database name
- `CORS_ORIGINS` — comma-separated allowed origins (e.g. `https://tinyexplorers.bm`)
