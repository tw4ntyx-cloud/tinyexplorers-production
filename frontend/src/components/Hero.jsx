import React from "react";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Container } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { IMAGES, BRAND, HERO } from "../data/content";
import {
  SplatFrame,
  DoodleSmile,
  DoodleBurst,
  DoodleUnderline,
} from "./decor/Splat";
import { useAdmissions } from "./layout/SiteLayout";

/**
 * Hero — recomposed for editorial calm.
 *
 * Changes from previous version:
 *  - Image cutouts use irregular hand-drawn SVG splats (not symmetric CSS blobs).
 *  - Replaced the wall of blurred color glows with ONE soft cream glow.
 *  - Reduced floating decor from 4 stars + 1 squiggle to 1 smile + 1 burst.
 *  - Replaced animate-ping (visually loud) with a calmer pulse-soft.
 *  - Moved "Now enrolling" badge above the headline (matches moodboard).
 *  - Reduced floating cards from 2 to 1 (the 1:4 ratio card) and tucked it
 *    cleanly into the bottom-right of the image cluster.
 *  - Tightened headline with clamp() and ledger-tight leading.
 *  - Marquee strip now genuinely animates via animate-marquee-x (was static).
 */
export default function Hero() {
  const openAdmissions = useAdmissions();
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative grain overflow-hidden pt-20 pb-16 sm:pt-28 md:pt-36 md:pb-28"
    >
      {/* One restrained warm glow — replaces previous three blurred color circles. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[42rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(251,194,71,0.22)_0%,transparent_70%)]"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 sm:gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* ─────────── Copy column ─────────── */}
          <div className="relative">
            {/* Locator (Hamilton · Bermuda · Est. 2026) */}
            <div
              data-testid="hero-locator"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-ink/70"
            >
              <MapPin size={13} strokeWidth={2.5} className="text-brand-orange" />
              {BRAND.location}
              <span className="mx-1 h-1 w-1 rounded-full bg-brand-ink/25" />
              {BRAND.established}
            </div>

            {/* "Now enrolling" pill — moved ABOVE the headline (per moodboard). */}
            <div
              data-testid="hero-badge"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink shadow-soft ring-1 ring-brand-ink/5"
            >
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-brand-green opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
              </span>
              {HERO.enrolling_label}
            </div>

            {/* Smile doodle — single curated accent, placed near the headline. */}
            <DoodleSmile
              className="mt-7 h-7 w-14 text-brand-green"
              color="#22C55E"
            />

            <h1 className="mt-4 font-poppins font-bold leading-[1.02] tracking-tight text-brand-ink"
                style={{ fontSize: "clamp(2rem, 5.5vw, 5.25rem)" }}>
              Where little
              <br className="hidden sm:block" /> minds grow through{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">play</span>
                <DoodleUnderline
                  className="absolute -bottom-2 left-0 z-0 h-3 w-full"
                  color="#FF6B2C"
                />
              </span>
              ,
              <br className="hidden sm:block" /> care, and confidence.
            </h1>

            <p className="mt-6 max-w-xl text-balance text-base leading-[1.6] text-brand-ink/70 sm:mt-7 sm:text-[1.0625rem] sm:leading-[1.7] md:text-[1.15rem]">
              {HERO.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-wrap sm:gap-3 xs:flex-row">
              <button
                onClick={openAdmissions}
                data-testid="hero-cta-primary"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-ink px-6 py-3.5 text-base font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02] hover:bg-brand-orange hover:shadow-soft-lg sm:px-7 sm:py-4"
              >
                {HERO.primary_cta}
                <ArrowRight
                  size={18}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
              <a
                href="#programs"
                data-testid="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-ink/15 bg-white/70 px-6 py-3.5 text-base font-semibold text-brand-ink transition-colors duration-300 ease-soft hover:border-brand-ink/30 hover:bg-white sm:px-7 sm:py-4"
              >
                {HERO.secondary_cta}
              </a>
            </div>

            {/* ─────────── Social proof — temporarily hidden for launch phase ─────────── */}
            {/* Preserved below for easy restoration once social metrics are established: */}
            {/* <div data-testid="hero-trust" className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4"> */}
            {/*   <div className="flex items-center gap-2.5"> ... statistics section ... </div> */}
            {/* </div> */}

            {/* Launch-stage trust message — minimal, editorial, builds confidence without data. */}
            <div
              data-testid="hero-launch-trust"
              className="mt-10 max-w-md text-sm leading-relaxed text-brand-ink/70"
            >
              {HERO.launch_trust_message}
            </div>
          </div>

          {/* ─────────── Visual column ─────────── */}
          <div className="relative h-[480px] sm:h-[560px] lg:h-[640px]">
            {/* Main splat image with a soft orange backing peeking out */}
            <SplatFrame
              variant="splat-1"
              backingClass="bg-brand-orange/22"
              backingOffset="translate-x-4 translate-y-4"
              className="absolute right-0 top-0 h-[78%] w-[88%]"
            >
              <div className="image-warm h-full w-full">
                <SmartImage
                  source={IMAGES.heroMain}
                  priority
                  sizes="(min-width: 1024px) 45vw, 88vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </SplatFrame>

            {/* Overlapping accent image — second splat variant, cream backing */}
            <SplatFrame
              variant="splat-2"
              backingClass="bg-brand-green/30"
              backingOffset="-translate-x-3 translate-y-3"
              className="absolute -left-2 bottom-0 h-[52%] w-[56%]"
            >
              <div className="image-warm h-full w-full">
                <SmartImage
                  source={IMAGES.heroAccent}
                  priority
                  sizes="(min-width: 1024px) 28vw, 56vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </SplatFrame>

            {/* Floating 1:4 ratio card — the one editorial moment we keep. */}
            <div
              data-testid="hero-ratio-card"
              className="absolute bottom-6 right-2 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-soft motion-safe:animate-float-slow md:flex"
            >
              <div className="font-poppins text-2xl font-bold leading-none text-brand-orange">
                1:4
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-ink/70">
                  Teacher : Child
                </div>
                <div className="text-sm font-semibold text-brand-ink">
                  Industry-leading ratio
                </div>
              </div>
            </div>

            {/* Curated decor — one burst star, one off-balance dot. That's it. */}
            <DoodleBurst
              className="absolute -top-1 right-12 h-5 w-5 motion-safe:animate-float-slow"
              color="#FBC247"
            />
            <div
              aria-hidden
              className="absolute right-[42%] top-[44%] h-3.5 w-3.5 rounded-full bg-brand-blue/90"
            />
          </div>
        </div>
      </Container>

      {/* Marquee strip — now genuinely animates (animate-marquee-x). */}
      <div className="relative mt-20 border-y border-brand-ink/10 py-5">
        <div className="marquee-mask overflow-hidden">
          <div className="motion-safe:animate-marquee-x flex w-max items-center gap-12 whitespace-nowrap px-6 text-[13px] font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
            {/* Duplicate the list so the loop seamlessly continues */}
            {[0, 1].map((dup) => (
              <React.Fragment key={dup}>
                <span>Certified educators</span>
                <span className="text-brand-orange">●</span>
                <span>Montessori-inspired</span>
                <span className="text-brand-green">●</span>
                <span>Outdoor learning</span>
                <span className="text-brand-yellow">●</span>
                <span>Allergy-aware snacks</span>
                <span className="text-brand-blue">●</span>
                <span>Reggio Emilia studio</span>
                <span className="text-brand-orange">●</span>
                <span>Bermuda Ministry registered</span>
                <span className="text-brand-green">●</span>
                <span>Open-door parent studio</span>
                <span className="text-brand-yellow">●</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
