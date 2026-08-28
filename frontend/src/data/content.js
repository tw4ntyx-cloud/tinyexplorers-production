/**
 * Single source of truth for site content.
 *
 * When the client supplies real photography, this is the only file that
 * needs to change. Image URLs, alt text, and any copy that can be swapped
 * by a content editor lives here.
 *
 * Components read from this file via named exports — no component should
 * hard-code an Unsplash/Pexels URL.
 */

export { PARENT_POLICIES } from "./policies";

/* ────────────────────────────────────────────────────────────
 *  IMAGES
 * ────────────────────────────────────────────────────────────
 * Each entry includes intrinsic width/height so <SmartImage> can
 * reserve layout space and avoid Cumulative Layout Shift.
 */

export const IMAGES = {
  heroMain: {
    src: "https://images.unsplash.com/photo-1763310225230-6e15b125935a?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxwcmVzY2hvb2wlMjBjbGFzc3Jvb20lMjBtb250ZXNzb3JpfGVufDB8fHx8MTc3ODYyNjkzOHww&ixlib=rb-4.1.0&q=85",
    alt: "Calm Montessori-style preschool classroom",
    width: 1200,
    height: 1500,
  },
  heroAccent: {
    src: "https://images.unsplash.com/photo-1777056491418-d4ff81a4ad92?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxjYW5kaWQlMjBjaGlsZCUyMHBsYXlpbmclMjBwcmVzY2hvb2x8ZW58MHx8fHwxNzc4NjI2OTM4fDA&ixlib=rb-4.1.0&q=85",
    alt: "Children engaged in creative play",
    width: 1000,
    height: 1000,
  },
  ctaPortrait: {
    src: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?crop=entropy&cs=srgb&fm=webp&w=900&q=85",
    alt: "A child smiling, ready to begin",
    width: 900,
    height: 1100,
  },
  environment: {
    src: "https://images.unsplash.com/photo-1763310225537-f7161d5c93e9?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxwcmVzY2hvb2wlMjBjbGFzc3Jvb20lMjBtb250ZXNzb3JpfGVufDB8fHx8MTc3ODYyNjkzOHww&ixlib=rb-4.1.0&q=85",
    alt: "Bright Scandinavian-inspired classroom with natural wood",
    width: 1200,
    height: 1400,
  },
  // A calm wellness-coded image — caregiver-and-child, warm natural light.
  // Used by the Wellness & Care section. Swap for client photography later.
  wellness: {
    src: "https://images.unsplash.com/photo-1602052793312-b99c2a9ee797?crop=entropy&cs=srgb&fm=webp&w=1200&q=85",
    alt: "An educator reading quietly with a child in a sunlit room",
    width: 1200,
    height: 1400,
  },
  programInfant: {
    src: "https://images.unsplash.com/photo-1685358230675-5cb5a9016232?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHw0fHx3b29kZW4lMjB0b3lzJTIwbnVyc2VyeXxlbnwwfHx8fDE3Nzg2MjY5Mzh8MA&ixlib=rb-4.1.0&q=85",
    alt: "Child playing with wooden letters",
    width: 940,
    height: 1175,
  },
  programToddler: {
    src: "https://images.unsplash.com/photo-1557452765-5b57d100c1dc?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxjYW5kaWQlMjBjaGlsZCUyMHBsYXlpbmclMjBwcmVzY2hvb2x8ZW58MHx8fHwxNzc4NjI2OTM4fDA&ixlib=rb-4.1.0&q=85",
    alt: "Toddler at a creative-play activity",
    width: 940,
    height: 1175,
  },
  programPreschool: {
    src: "https://images.pexels.com/photos/8363051/pexels-photo-8363051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940&fm=webp",
    alt: "Preschooler engaged in classroom activities",
    width: 940,
    height: 1175,
  },
  programAfterschool: {
    src: "https://images.pexels.com/photos/8363049/pexels-photo-8363049.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940&fm=webp",
    alt: "Young child in a relaxed classroom setting",
    width: 940,
    height: 1175,
  },
  gallery: {
    g1: {
      src: "https://images.unsplash.com/photo-1567746455504-cb3213f8f5b8?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxwcmVzY2hvb2wlMjBjbGFzc3Jvb20lMjBtb250ZXNzb3JpfGVufDB8fHx8MTc3ODYyNjkzOHww&ixlib=rb-4.1.0&q=85",
      alt: "Open studio with natural light",
      width: 1200, height: 1500,
    },
    g2: {
      src: "https://images.unsplash.com/photo-1642379831546-67d5e2bf8bcc?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjB0b3lzJTIwbnVyc2VyeXxlbnwwfHx8fDE3Nzg2MjY5Mzh8MA&ixlib=rb-4.1.0&q=85",
      alt: "Shelf of wooden discovery toys",
      width: 1200, height: 1200,
    },
    g3: {
      src: "https://images.unsplash.com/photo-1763310225230-6e15b125935a?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxwcmVzY2hvb2wlMjBjbGFzc3Jvb20lMjBtb250ZXNzb3JpfGVufDB8fHx8MTc3ODYyNjkzOHww&ixlib=rb-4.1.0&q=85",
      alt: "Tiny kitchen practical-life play area",
      width: 1200, height: 1200,
    },
    g4: {
      src: "https://images.unsplash.com/photo-1777056491418-d4ff81a4ad92?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxjYW5kaWQlMjBjaGlsZCUyMHBsYXlpbmclMjBwcmVzY2hvb2x8ZW58MHx8fHwxNzc4NjI2OTM4fDA&ixlib=rb-4.1.0&q=85",
      alt: "Children learning side-by-side in a Reggio circle",
      width: 1200, height: 1200,
    },
    g5: {
      src: "https://images.pexels.com/photos/8363051/pexels-photo-8363051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940&fm=webp",
      alt: "A child mid-thought on an art day",
      width: 940, height: 940,
    },
    g6: {
      src: "https://images.unsplash.com/photo-1763310225537-f7161d5c93e9?crop=entropy&cs=srgb&fm=webp&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxwcmVzY2hvb2wlMjBjbGFzc3Jvb20lMjBtb250ZXNzb3JpfGVufDB8fHx8MTc3ODYyNjkzOHww&ixlib=rb-4.1.0&q=85",
      alt: "Afternoon quiet hour in the studio",
      width: 1200, height: 1200,
    },
  },
};

/* ────────────────────────────────────────────────────────────
 *  COPY
 * ────────────────────────────────────────────────────────────
 * String constants used across the site. When marketing copy
 * changes, this is the only place to edit.
 */

const PUBLIC_URL = process.env.PUBLIC_URL || "";

/**
 * Canonical production origin — used for canonical/OG URLs and the sitemap.
 * The route path comes from PUBLIC_URL so project-style GitHub Pages
 * deployments resolve correctly without hardcoded document paths.
 *
 * Defaults to the current GitHub Pages staging origin. At launch, set
 * REACT_APP_WEBSITE_URL=https://tinyexplorersbda.com at build time — no
 * source changes required.
 */
export const SITE_URL = process.env.REACT_APP_WEBSITE_URL || "https://tw4ntyx-cloud.github.io";

export const TOUR_BOOKING = {
  url: process.env.REACT_APP_TOUR_BOOKING_URL || "https://calendar.app.google/PKmUZbas6Hyo397WA",
  name: "Tiny Explorers Nursery Tour",
  duration: "30 minutes",
  location: "59 Victoria St, Hamilton, Bermuda",
};

export function getPublicAssetUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_URL}${normalizedPath}`;
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPath = pathname === "/" ? "" : pathname;
  return `${SITE_URL}${getPublicAssetUrl(normalizedPath)}`;
}

export const DEFAULT_META = {
  title: "Home | Tiny Explorers Nursery & Preschool",
  description:
    "Discover Tiny Explorers Nursery & Preschool in Bermuda, with calm early-years spaces, thoughtful care, and play-based programs for children from infancy through after-school.",
};

export const BRAND = {
  name: "Tiny Explorers Nursery & Preschool",
  slogan: "Where learning blossoms, and adventures begin.",
  description: "A Bermuda-based early childhood center where curiosity meets care. Hamilton & Paget campuses.",
  established: "Est. 2026",
  location: "Hamilton · Bermuda",
  // PRE-LAUNCH TODO: no verified phone number yet — email is the sole contact
  // method until a real Tiny Explorers phone number is confirmed.
  email: "hello@tinyexplorersbda.com",
  address: "12 Reid Street, Hamilton HM 11, Bermuda",
};

export const HERO = {
  headline_lead: "Where little minds grow through",
  headline_emphasis: "play",
  headline_tail: ", care, and confidence.",
  enrolling_label: "Now enrolling · Fall 2026",
  description:
    "A Bermuda-based early childhood center for curious children and discerning families. Calm spaces, thoughtful educators, and a day designed around how children actually thrive.",
  primary_cta: "Start Enrollment",
  secondary_cta: "Explore Programs",
  /* Social proof statistics — temporarily hidden for launch phase. */
  trust_count: "240+",
  trust_label: "Bermuda families",
  trust_sub: "trust us with their little ones",
  rating: "4.9 / 5",
  rating_sub: "parent rating",
  /* Launch-stage trust message — replaces statistics during soft launch. */
  launch_trust_message: "Thoughtfully designed. Now welcoming families Fall 2026.",
};

export const PROGRAMS = [
  {
    name: "Infant Care",
    age: "6 – 18 months",
    desc: "Gentle routines, sensory exploration, and one-on-one bonding.",
    image: "programInfant",
    accent: "#60A5FA",
    testId: "program-infant",
    programOption: "Infant Care (6–18 mo)",
    philosophy:
      "Every rhythm is designed around attachment, comfort, and the first foundations of independent exploration.",
    daily_rhythm: [
      "Quiet morning welcome and gentle sensory circles.",
      "Guided rest and nap rhythms, with soft transitions.",
      "Individual nurturing moments, feeding, and exploration.",
      "Small, predictable group experiences with play-based discovery.",
    ],
    atmosphere:
      "Warm, softly lit rooms with natural textures and intimate care corners for close, calm connection.",
    activities: [
      "Tummy time with tactile materials.",
      "Soothing story and song moments.",
      "Mirror and soft-object discovery.",
      "Personalized caregiver-led exploration.",
    ],
  },
  {
    name: "Toddler Program",
    age: "18 – 36 months",
    desc: "Language-rich days, art, music, and outdoor play with loving structure.",
    image: "programToddler",
    accent: "#22C55E",
    testId: "program-toddler",
    programOption: "Toddler Program (18–36 mo)",
    philosophy:
      "Language, social confidence, and practical independence grow through scaffolded choice and joyful routines.",
    daily_rhythm: [
      "Warm arrival, morning circle, and purposeful small-group time.",
      "Snack, movement, and sensory-rich exploration.",
      "Outdoor play and garden-based learning.",
      "Restful reflection and calm creative moments.",
    ],
    atmosphere:
      "Gentle, sunlit spaces with low shelves, tactile materials, and intentional zones for art, play, and rest.",
    activities: [
      "Loose-part building and storytelling.",
      "Song-led movement and creative art.",
      "Nature walks and sensory investigations.",
      "Small-group language circles to build vocabulary.",
    ],
  },
  {
    name: "Preschool Program",
    age: "3 – 5 years",
    desc: "Project-based learning in literacy, numeracy, science and the arts.",
    image: "programPreschool",
    accent: "#FF6B2C",
    testId: "program-preschool",
    programOption: "Preschool (3–5 yr)",
    philosophy:
      "Children learn best through meaningful projects that balance curiosity, routine, and creative expression.",
    daily_rhythm: [
      "Morning meeting and inquiry-based project work.",
      "Guided literacy and numeracy experiences.",
      "Outdoor investigation and reflective play.",
      "Quiet choice time and learning reflection.",
    ],
    atmosphere:
      "Editorial calm studios with soft earth-toned materials, focused work tables, and cozy reading niches.",
    activities: [
      "Mini design projects with natural materials.",
      "Outdoor science investigations.",
      "Guided literacy circles.",
      "Hands-on math and creative problem-solving.",
    ],
  },
  {
    name: "After School Care",
    age: "5 – 8 years",
    desc: "A warm landing after the bell — homework, snacks, and unhurried play.",
    image: "programAfterschool",
    accent: "#E5A82E",
    testId: "program-afterschool",
    programOption: "After School Care (5–8 yr)",
    philosophy:
      "After school is a restful extension of the day: supportive, engaging, and centered on belonging.",
    daily_rhythm: [
      "Warm welcome and snack time.",
      "Homework support and quiet focus.",
      "Creative choice activities and outdoor play.",
      "Gentle wind-down and connection before pickup.",
    ],
    atmosphere:
      "Relaxed lounge-style corners, softly lit maker spaces, and calm homework nooks with fresh-air access.",
    activities: [
      "Homework club with attentive support.",
      "Creative maker projects.",
      "Garden games and movement.",
      "Small-group story and reflection circles.",
    ],
  },
];

export const TESTIMONIAL = {
  /* Parent testimonial — temporarily hidden for launch phase. */
  quote_lead: "Within a week our daughter was racing to the door each morning. The teachers",
  quote_emphasis: "truly know her",
  quote_tail: " — and us. It feels like a small village raising her well.",
  author: "Maya Astwood",
  context: "Parent of Olive · Toddler Program · Hamilton",
  initials: "MA",
  rating: "4.9 / 5",
  review_count: 87,
  /* Launch-stage trust message — replaces reviews during soft opening. */
  launch_message: "We open our doors Fall 2026 to our first families. We're thoughtfully designed, deeply intentional, and ready to welcome curious children into a community that knows them.",
};

/**
 * Wellness & Care section — copy + pillars + trust card.
 *
 * Keep the language emotionally intelligent and quietly confident.
 * Avoid medical jargon ("clinic", "patient", "treatment") — the section
 * is the wellness side of nurturing care, not a pediatric office.
 *
 * `pillars[i].icon` is a string key resolved against PILLAR_ICONS in
 * Wellness.jsx — adding a pillar means updating both files.
 */
export const WELLNESS = {
  eyebrow: "Wellness & Care",
  title_lead: "Thoughtful care for ",
  title_emphasis: "growing minds",
  title_tail: " and growing bodies.",
  lede:
    "Beyond curriculum, wellbeing is woven into every day at Tiny Explorers — from on-call health support to intentional spaces and unhurried rhythms that nurture the whole child. Holistic care your family can feel.",
  cta: "Speak with our care team",
  pillars: [
    {
      icon: "Stethoscope",
      title: "Health support",
      desc:
        "An on-call nurse provides guidance on growth, sleep, nutrition and the everyday questions of early parenthood.",
      accent: "#22C55E",
      testId: "wellness-pillar-pediatric",
    },
    {
      icon: "Wind",
      title: "Calm Daily Rhythms",
      desc:
        "Acoustic-softened spaces and predictable routines designed to reduce overstimulation and protect deep play.",
      accent: "#60A5FA",
      testId: "wellness-pillar-rhythms",
    },
    {
      icon: "MessageCircleHeart",
      title: "Parent Partnership",
      desc:
        "Daily notes, monthly one-to-ones, and an always-open studio door — your child's care, shared honestly.",
      accent: "#FF6B2C",
      testId: "wellness-pillar-partnership",
    },
  ],
  trust_card: {
    label: "On-call nurse",
    name: "Lena Trott",
    role: "Registered Nurse · Bermuda licensed",
    cert: "Bermuda Ministry registered",
  },
};

/* ════════════════════════════════════════════════════════════════════
 *  NAVIGATION
 * ════════════════════════════════════════════════════════════════════
 * Single source of truth for the site nav (desktop + mobile + footer).
 * Items can be:
 *   - flat: { label, to }
 *   - grouped: { label, items: [{ label, to, desc? }] }   (renders as dropdown)
 *
 * Routes resolve via React Router. Use absolute paths (start with /) for
 * page routes, and href anchors (start with #) for homepage section jumps.
 */
export const NAV = [
  { label: "Programs", to: "/#programs" },
  {
    label: "About",
    items: [
      { label: "Our Philosophy", to: "/philosophy", desc: "How we teach, and why." },
      { label: "Environment", to: "/#environment", desc: "Calm spaces, intentional design." },
      { label: "Wellness & Care", to: "/wellness", desc: "On-call health support, holistic care." },
    ],
  },
  {
    label: "Experiences",
    items: [
      { label: "Adventures & Field Trips", to: "/adventures", desc: "Bermuda, beyond the classroom." },
      { label: "Gallery", to: "/#gallery", desc: "A peek inside our week." },
    ],
  },
  {
    label: "Parents",
    items: [
      { label: "Parent Information", to: "/parents", desc: "Hours, schedules, FAQ." },
      { label: "Admissions", to: "/admissions", desc: "Visit, apply, enroll." },
      { label: "Policies", to: "/parents#policies", desc: "Policies and guidance for families." },
    ],
  },
];

/* ════════════════════════════════════════════════════════════════════
 *  FOOTER
 * ════════════════════════════════════════════════════════════════════
 * Separate from BRAND.slogan — this is the footer-only tagline that
 * lives below the logo. Kept short, evocative, and Bermuda-rooted.
 */
export const FOOTER = {
  tagline: "Where Learning Blossoms, and Adventures Begin",
  bermuda_note: "Designed for island children, raised under the Bermuda sun.",
  newsletter_lede:
    "Open house dates, parenting essays, and the occasional poem from a three-year-old.",
  columns: [
    {
      title: "Programs",
      links: [
        { label: "Infant Care", to: "/#program-infant-care" },
        { label: "Toddler Program", to: "/#program-toddler-program" },
        { label: "Preschool", to: "/#program-preschool-program" },
        { label: "After School", to: "/#program-after-school-care" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Philosophy", to: "/philosophy" },
        { label: "Environment", to: "/#environment" },
        { label: "Wellness & Care", to: "/wellness" },
        { label: "Educators", to: "/philosophy#educators" },
      ],
    },
    {
      title: "Parents",
      links: [
        { label: "Parent Information", to: "/parents" },
        { label: "Admissions", to: "/admissions" },
        { label: "Daily Schedule", to: "/parents#schedule" },
        { label: "FAQ", to: "/parents#faq" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Book a Tour", href: TOUR_BOOKING.url, external: true },
        { label: "Adventures", to: "/adventures" },
        { label: "Gallery", to: "/#gallery" },
        { label: "Careers", to: "/parents#careers" },
      ],
    },
  ],
  legal: [
    { label: "Privacy", to: "/policies/privacy-confidentiality-policy" },
    { label: "Accessibility", to: "/accessibility" },
  ],
};

/* ════════════════════════════════════════════════════════════════════
 *  PHILOSOPHY PAGE
 * ════════════════════════════════════════════════════════════════════ */
export const PHILOSOPHY = {
  meta: {
    title: "Our Philosophy | Tiny Explorers Nursery & Preschool",
    description:
      "Learn how Tiny Explorers approaches early childhood education through calm environments, respectful guidance, and close partnership with families.",
  },
  hero: {
    eyebrow: "Our Philosophy",
    title_lead: "Where children are met",
    title_emphasis: "as whole people",
    title_tail: ", not future ones.",
    lede:
      "We don't prepare children for the next grade. We prepare them for their own lives — through play, through wonder, through the quiet competence that grows when adults trust them to try.",
  },
  manifesto: {
    eyebrow: "Manifesto",
    title: "Eight beliefs we plan our days around.",
    items: [
      "Childhood is not a rehearsal — it is its own season, complete in itself.",
      "A child's curiosity is the most reliable curriculum.",
      "Calm rooms grow calm minds.",
      "Play is serious work, and we treat it that way.",
      "Children deserve adults who slow down to meet them.",
      "Nature belongs in every day, even on the rainy ones.",
      "Mistakes are how the brain learns — never how a child is judged.",
      "Family is the first classroom, and we are honored to be the second.",
    ],
  },
  child_led: {
    eyebrow: "Child-led learning",
    title: "We follow the child, then gently widen the path.",
    lede:
      "Each morning begins with choice. A child can return to yesterday's tower, settle into a tray of pouring work, or join a friend at the easel. Educators observe, document, and quietly seed the next invitation. Learning emerges — it isn't imposed.",
    pillars: [
      {
        title: "Observation first",
        desc:
          "Educators spend the first hour each morning watching, not teaching — noting where each child is in their development.",
      },
      {
        title: "Prepared environments",
        desc:
          "Materials are placed within reach, ordered by complexity, and rotated weekly based on the children's emerging interests.",
      },
      {
        title: "Open invitations",
        desc:
          "Provocations — a leaf collection, a number puzzle, a story basket — are offered, never required.",
      },
    ],
  },
  emotional: {
    eyebrow: "Emotional development",
    title: "Big feelings, met with steady hands.",
    lede:
      "Before a child can spell or count, they need to feel safe enough to try. Our days are built around the small moments where regulation, empathy, and self-respect are quietly practiced.",
    bullets: [
      "Co-regulation before correction — we sit alongside, we don't time out.",
      "A vocabulary for feelings, taught early and often.",
      "Conflict treated as a learning opportunity, with adult support.",
      "Goodbye rituals at drop-off that honor the difficulty of leaving.",
    ],
  },
  play: {
    eyebrow: "Play-based learning",
    title: "Block by block, story by story, the brain is built.",
    lede:
      "Children at play are children at work. Pouring water trains motor control. Setting a tea party rehearses social grammar. Building a tower tests gravity and grit. We protect long, uninterrupted blocks of free play because the most important learning happens there.",
    quote:
      "Play is the highest form of research.",
    quote_author: "Albert Einstein",
  },
  calm: {
    eyebrow: "Calm environments",
    title: "Rooms designed to lower a child's shoulders.",
    lede:
      "Natural light. Soft acoustics. Wooden tools. Plants on every shelf. We chose every surface and sound to reduce the sensory load children carry in modern life — so their attention can stretch toward what they love.",
    bullets: [
      "Acoustic-softened ceilings and warm-tone lighting.",
      "Materials in natural wood, cotton, glass and clay.",
      "No screens during the program day — anywhere.",
      "A quiet room available all day for rest or solo time.",
    ],
  },
  partnership: {
    eyebrow: "Parent partnership",
    title: "The most powerful classroom is the one between us.",
    lede:
      "Your child carries home what they learn from us, and brings to us what they learn from you. We treat that exchange as the real curriculum — with daily notes, monthly one-to-ones, and an always-open studio door.",
    pillars: [
      {
        title: "Daily reflections",
        desc: "A short end-of-day note from your child's lead educator — a moment, not a checklist.",
      },
      {
        title: "Monthly one-to-ones",
        desc: "Twenty minutes, just family and educator, to talk about who your child is becoming.",
      },
      {
        title: "Open studio",
        desc: "Parents are welcome in the classroom — to read a story, to share work, to simply observe.",
      },
    ],
  },
  closing: {
    quote:
      "We aren't raising students. We are raising people. The rest follows.",
    attribution: "Tiny Explorers Educators",
  },
};

/* ════════════════════════════════════════════════════════════════════
 *  WELLNESS PAGE (deeper than the homepage section)
 * ════════════════════════════════════════════════════════════════════ */
export const WELLNESS_PAGE = {
  meta: {
    title: "Wellness & Care | Tiny Explorers Nursery & Preschool",
    description:
      "See how Tiny Explorers supports children's wellbeing with calm routines, healthy daily habits, and responsive family communication.",
  },
  hero: {
    eyebrow: "Wellness & Care",
    title_lead: "Care that begins",
    title_emphasis: "before learning does",
    title_tail: ".",
    lede:
      "A well-cared-for child can do extraordinary things. Our wellness program — guided by on-call health support and supported by nutrition, rest, and gentle sensory design — protects the foundation everything else rests on.",
  },
  pediatrician: {
    eyebrow: "Health support",
    title: "On-call nurse, available when families need it.",
    lede:
      "Our nurse is available to families by appointment. From sleep questions to seasonal sniffles, parents have a trusted voice for everyday care decisions.",
    bullets: [
      "Regular check-ins and practical guidance built into the week.",
      "Same-day support on common childhood illness and comfort concerns.",
      "Coordination with your family doctor — never a replacement.",
      "Private conversations on campus or by phone when you need them.",
    ],
    credential_cards: [
      { label: "Qualified", value: "Registered Nurse — Bermuda licensed" },
      { label: "Experience", value: "Community health and early childhood support" },
      { label: "Focus", value: "Family-centered guidance" },
    ],
  },
  philosophy: {
    eyebrow: "Wellness philosophy",
    title: "Wellbeing is not an add-on — it's the foundation.",
    lede:
      "We treat wellness as inseparable from learning. Nutrition shapes attention. Sleep shapes memory. Felt safety shapes courage. Every choice we make — from snack timing to lighting temperature — is a wellness choice.",
  },
  nutrition: {
    eyebrow: "Nutrition",
    title: "Healthy habits, supported every day.",
    lede:
      "Families send lunches and snacks from home. We support calm mealtime routines, allergy awareness, hydration, and a food-safe environment where children learn healthy eating habits together.",
    pillars: [
      {
        title: "Parent-provided meals",
        desc: "Children bring nourishing lunches and snacks in labelled containers. Educators support calm, shared eating routines.",
      },
      {
        title: "Allergy-aware practice",
        desc: "We keep the classroom nut-aware, honour food sensitivities, and help children learn respect for different needs.",
      },
      {
        title: "Hydration + routine",
        desc: "Water bottles are refilled throughout the day, and snack moments are used to teach pausing, listening, and easy transitions.",
      },
    ],
  },
  safety: {
    eyebrow: "Safety & hygiene",
    title: "Quiet vigilance, woven into every day.",
    bullets: [
      "Keycard entry, monitored visitor log, and CCTV at every entrance.",
      "Daily deep-clean of high-touch surfaces; HEPA filtration in every room.",
      "Two staff members trained in pediatric first aid in every classroom.",
      "Annual safeguarding training for every adult on campus.",
      "Allergen-aware kitchen with a dedicated nut-free zone.",
      "Quarterly fire and shelter drills, practiced as games.",
    ],
  },
  rest: {
    eyebrow: "Rest & calm spaces",
    title: "A quiet room is always nearby.",
    lede:
      "Sleep and rest are not afterthoughts. Each program room has an adjacent dim-lit nest where any child can retreat to rest, read, or simply breathe. Naps are protected. Quiet time is non-negotiable.",
  },
  communication: {
    eyebrow: "Parent communication",
    title: "You'll always know how your child's day went.",
    lede:
      "We believe trust is built through small, consistent communication — not glossy quarterly reports.",
    steps: [
      { title: "Daily note", desc: "A short end-of-day reflection from your child's lead educator." },
      { title: "Weekly photos", desc: "A small private gallery of meaningful moments, never staged." },
      { title: "Monthly one-to-one", desc: "Twenty minutes with the lead educator to talk about your child." },
      { title: "Open door", desc: "If something doesn't sit right, we want to hear about it — that day." },
    ],
  },
  policies: {
    eyebrow: "Health policies",
    title: "Clear, kind, evidence-based.",
    items: [
      { q: "When should I keep my child home?", a: "Fever above 100.4°F, persistent vomiting or diarrhea within 24 hours, undiagnosed rash, or any symptom that prevents your child from comfortably participating in the day." },
      { q: "What's your medication policy?", a: "Prescribed medications can be administered by our nurse with written parental authorization. We do not administer over-the-counter medications without a doctor's note." },
      { q: "Do you require vaccinations?", a: "Yes — we follow the Bermuda Department of Health's immunization schedule and require up-to-date records on enrollment. Medical exemptions are reviewed case-by-case." },
      { q: "What happens if my child gets sick during the day?", a: "We'll call you within thirty minutes and care for your child in our quiet room until pickup. Our on-call nurse is available for guidance." },
    ],
  },
};

/* ════════════════════════════════════════════════════════════════════
 *  ADVENTURES & FIELD TRIPS PAGE
 * ════════════════════════════════════════════════════════════════════ */
export const ADVENTURES = {
  meta: {
    title: "Adventures & Field Trips | Tiny Explorers Nursery & Preschool",
    description:
      "Explore the outings, nature walks, and cultural experiences that extend learning beyond the classroom at Tiny Explorers.",
  },
  hero: {
    eyebrow: "Adventures & Field Trips",
    title_lead: "An island",
    title_emphasis: "is the classroom",
    title_tail: " — we just open the door.",
    lede:
      "Bermuda is one of the world's most extraordinary places to be small. Pink-sand beaches, coral reefs, botanical gardens, working farms, working artists — all within twenty minutes of our doorstep. Adventures aren't extras at Tiny Explorers. They are the curriculum, breathing.",
  },
  intro: {
    eyebrow: "Why we go outside",
    title: "Children learn what they touch.",
    lede:
      "A child who has held a piece of pink coral understands a coastline differently than a child who has only seen one in a book. We design our adventures around hand, eye, and heart — never around novelty.",
  },
  pillars: [
    {
      icon: "Sun",
      title: "Nature & ocean",
      desc:
        "Tide-pool walks at Spittal Pond. Mangrove paddles in Hungry Bay. Sandcastle architecture at Horseshoe.",
    },
    {
      icon: "Map",
      title: "Cultural outings",
      desc:
        "Bermuda National Gallery family mornings. Heritage Museum visits. Storytelling at Verdmont House.",
    },
    {
      icon: "Sparkles",
      title: "Creative workshops",
      desc:
        "Pottery at Dockyard Glassworks. Print-making with local artists. Music with a steel-pan teacher in residence.",
    },
    {
      icon: "Leaf",
      title: "Working farms",
      desc:
        "Wadson's Farm planting days. Honeybee visits in spring. Seasonal harvests we eat back at school.",
    },
  ],
  calendar: {
    eyebrow: "This term's journey",
    title: "A few of the adventures ahead.",
    items: [
      {
        season: "Spring",
        date: "Mar — May 2026",
        title: "The Reef & The Roots",
        desc: "Six weeks of ocean and earth — snorkel mornings at John Smith's Bay, planting beds at Wadson's, a closing exhibition of children's coral drawings.",
        color: "#22C55E",
      },
      {
        season: "Summer",
        date: "Jun — Aug 2026",
        title: "Sand, Stories & Sound",
        desc: "Beach mornings paired with a steel-pan residency. Children compose and perform a small island suite at the closing parents' afternoon.",
        color: "#FBC247",
      },
      {
        season: "Autumn",
        date: "Sep — Nov 2026",
        title: "Hands at Work",
        desc: "A craft term — pottery at Dockyard, weaving at the Heritage Museum, and a children's market stall at Christmas Walkabout.",
        color: "#FF6B2C",
      },
      {
        season: "Winter",
        date: "Dec — Feb 2027",
        title: "Light & Listening",
        desc: "Lantern walks, observatory visits, and a quiet-listening series — naturalists, storytellers, musicians — invited into our studio.",
        color: "#60A5FA",
      },
    ],
  },
  future_note: {
    eyebrow: "Future adventures",
    title: "We add new ones every term.",
    lede:
      "If your family has a connection — a working studio, a research vessel, a kitchen, a craft — we'd love to hear about it. Our richest adventures begin with a parent's quiet suggestion.",
  },
};

/* ════════════════════════════════════════════════════════════════════
 *  PARENT INFORMATION PAGE
 * ════════════════════════════════════════════════════════════════════ */
export const PARENTS = {
  meta: {
    title: "Parent Information | Tiny Explorers Nursery & Preschool",
    description:
      "Find practical parent information about hours, age groups, daily rhythm, communication, and school routines at Tiny Explorers.",
  },
  hero: {
    eyebrow: "Parent Information",
    title_lead: "Everything",
    title_emphasis: "you need to know",
    title_tail: ", calmly explained.",
    lede:
      "Choosing care for your child is full of small, important questions. This page is the practical companion to our philosophy — hours, ages, meals, drop-off rhythms, and the answers we get asked most often.",
  },
  hours: {
    eyebrow: "Operating hours",
    title: "Open when you need us.",
    items: [
      { label: "Monday — Friday", value: "7:30 AM — 6:00 PM" },
      { label: "Drop-off window", value: "7:30 — 9:00 AM" },
      { label: "Pickup window", value: "3:30 — 6:00 PM" },
      { label: "Closed", value: "Public holidays · last week of August · between Christmas and New Year" },
    ],
  },
  age_groups: {
    eyebrow: "Age groups",
    title: "Programs by stage of small.",
    items: [
      { age: "6 – 18 months", name: "Infant Care", ratio: "1 : 3" },
      { age: "18 – 36 months", name: "Toddler Program", ratio: "1 : 4" },
      { age: "3 – 5 years", name: "Preschool Program", ratio: "1 : 6" },
      { age: "5 – 8 years", name: "After School Care", ratio: "1 : 8" },
    ],
  },
  schedule: {
    eyebrow: "A typical day",
    title: "The rhythm of a morning.",
    items: [
      { time: "7:30 — 8:30", title: "Soft arrival", desc: "Children settle in, hang their coat, and choose their first work." },
      { time: "8:30 — 9:00", title: "Morning snack", desc: "A calm snack period with items from home, shared at low tables." },
      { time: "9:00 — 11:00", title: "Long work cycle", desc: "Uninterrupted play and Montessori work, with educators observing." },
      { time: "11:00 — 12:00", title: "Outdoor & nature", desc: "Garden time, neighbourhood walks, or beach mornings in season." },
      { time: "12:00 — 12:45", title: "Lunch", desc: "Home-packed lunches are enjoyed together with adult support and a slow, settled rhythm." },
      { time: "12:45 — 2:30", title: "Rest & quiet time", desc: "Naps for those who need them. Quiet reading or solo work for those who don't." },
      { time: "2:30 — 3:30", title: "Studio afternoon", desc: "Art, music, gardening, or a workshop with a visiting maker." },
      { time: "3:30 — 6:00", title: "Open pickup", desc: "Free play, snack, and the unhurried wind-down toward home." },
    ],
  },
  bring: {
    eyebrow: "What to bring",
    title: "A short, kind packing list.",
    items: [
      "Two complete changes of clothes, labelled.",
      "Soft indoor shoes — we wear them through the program day.",
      "A sun hat and reef-safe sunscreen.",
      "A small blanket or comfort object for rest time, if needed.",
      "A reusable water bottle. (Meals and snacks should be packed from home.)",
    ],
  },
  meals: {
    eyebrow: "Meals & snacks",
    title: "Packed-from-home lunches and calm snack rhythms.",
    lede:
      "Families send nourishing food in labelled containers. We support allergy-aware choices, shared routines, and gentle table habits so children can eat with ease.",
  },
  communication: {
    eyebrow: "Parent communication",
    title: "How we stay in touch.",
    items: [
      { title: "Daily note", desc: "A short end-of-day reflection from your child's lead educator." },
      { title: "Weekly photos", desc: "A small private gallery, never staged." },
      { title: "Monthly one-to-one", desc: "Twenty minutes with the lead educator." },
      { title: "Emergency phone", desc: "Direct line, answered by a real adult, during all operating hours." },
    ],
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "Questions parents most often have.",
    items: [
      { q: "How does drop-off work for new families?", a: "We use a phased start. The first week is short days with a parent staying nearby. By week two, most children are happily settling on their own. Our educators will guide you through the rhythm that fits your child." },
      { q: "What's the language environment like?", a: "English is our primary language, with regular exposure to other languages from our multilingual educators. Spanish, French, and Portuguese all naturally appear in the room." },
      { q: "Do you accept children with additional needs?", a: "We welcome inquiries from every family. We work closely with occupational therapists, speech therapists, and family pediatricians on individual plans. Where we're not the right fit, we'll say so kindly." },
      { q: "How do you handle screens and technology?", a: "We don't use screens with the children during the program day. Educators use tablets only for daily-note photo capture, away from the children's view." },
      { q: "What is the educator-to-child ratio?", a: "1:3 in infant care, 1:4 in toddlers, 1:6 in preschool, and 1:8 in after-school care. All below Bermuda Ministry minimums." },
      { q: "Can I tour before applying?", a: "Yes, and we encourage it. Book a 30-minute nursery tour online through our Google Calendar appointment schedule." },
    ],
  },
};

/* ════════════════════════════════════════════════════════════════════
 *  ADMISSIONS PAGE
 * ════════════════════════════════════════════════════════════════════ */
export const ADMISSIONS = {
  meta: {
    title: "Admissions | Tiny Explorers Nursery & Preschool",
    description:
      "Review the Tiny Explorers admissions process, from first inquiry to tour, application, and enrollment preparation.",
  },
  hero: {
    eyebrow: "Admissions",
    title_lead: "A calm path into",
    title_emphasis: "a calm school",
    title_tail: ".",
    lede:
      "Choosing where your child will spend their early years is one of the most meaningful decisions you'll make. We've designed admissions to be unhurried, warm, and conversational — because that's exactly how it feels to be a family here.",
    cta_primary: "Start an inquiry",
    cta_secondary: "Book a tour",
  },
  steps: {
    eyebrow: "How it works",
    title: "Four small, unhurried steps.",
    items: [
      {
        title: "Inquire",
        desc: "Tell us a little about your child and what you're looking for. We'll respond within one business day.",
      },
      {
        title: "Visit",
        desc: "Come for a private tour — see the rooms, meet our lead educators, ask the real questions.",
      },
      {
        title: "Apply",
        desc: "If we feel like a fit for one another, complete a short application and meet for a brief family conversation.",
      },
      {
        title: "Welcome",
        desc: "We confirm your child's place, plan their phased start, and begin the gentle work of joining the school.",
      },
    ],
  },
  visit: {
    eyebrow: "Visit us",
    title: "Book a 30-minute nursery tour.",
    lede:
      "Come and experience Tiny Explorers Nursery & Preschool in person. Google Calendar handles available times, booking confirmations, invitations, and reminders.",
    bullets: [
      "Explore the learning environment and programme rooms",
      "Learn about our approach to early childhood education",
      "Ask questions during a 30-minute visit at 59 Victoria St, Hamilton",
    ],
  },
  tuition: {
    eyebrow: "Tuition",
    title: "Transparent, by inquiry.",
    lede:
      "We share full tuition information after your first visit. We've found numbers mean more in context — once you've seen the rooms, met the educators, and asked your questions. Sibling discounts and a need-based assistance fund are both available; please ask.",
  },
  waitlist: {
    eyebrow: "Waitlist",
    title: "If we're full when you find us.",
    lede:
      "We hold deliberately small class sizes, so a waitlist is common — especially for the toddler and preschool years. We work hard to be transparent: when you join the waitlist, we'll tell you where you sit, when openings are expected, and we'll check in quarterly so it never feels like a black box.",
  },
  faq: {
    eyebrow: "Admissions FAQ",
    title: "What parents usually ask first.",
    items: [
      { q: "When should we apply?", a: "Most families inquire 6–12 months before their desired start. The infant and toddler programs fill earliest. That said — if you're reading this, the right time to inquire is today." },
      { q: "Do you offer trial days?", a: "Yes. Once we've met and shared application materials, we offer a half-day visit so your child can experience the room with their potential class." },
      { q: "What if my child has never been in care before?", a: "Most haven't. We use a phased start over the first one to two weeks, beginning with short visits with a parent staying nearby. By the second week, most children are happily settling on their own." },
      { q: "Are there siblings priority?", a: "Yes — siblings of currently-enrolled children move to the top of the waitlist for their age group." },
      { q: "Is financial assistance available?", a: "We have a small need-based assistance fund and offer sibling discounts. We'd rather have the right family at a fair price than the wrong family at full price." },
    ],
  },
};


