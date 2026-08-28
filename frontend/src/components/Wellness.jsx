import React from "react";
import { Stethoscope, Wind, MessageCircleHeart, ArrowRight } from "lucide-react";
import { Section, Container, Eyebrow } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { SplatFrame, DoodleDots } from "./decor/Splat";
import { IMAGES, WELLNESS } from "../data/content";
import { useTour } from "./layout/SiteLayout";

/**
 * Wellness & Care — the homepage's emotional trust anchor.
 *
 * Composition rationale:
 *   - The preceding Environment section uses image-LEFT / copy-RIGHT, so
 *     this section deliberately mirrors it (copy-LEFT / image-RIGHT) to
 *     create scroll rhythm and avoid two adjacent identical splits.
 *   - Tone register is "luxury family wellness brand meets Montessori" —
 *     warm cream surface, a single green accent (calm, growth, care) and
 *     the most restrained orange touch on the CTA. No clinical blues, no
 *     stethoscope-on-white pediatric tropes.
 *   - Visual primitives reused from the existing system:
 *       <Section>, <Container>, <Eyebrow>   — section rhythm + reveal
 *       <SmartImage>                         — CLS-safe lazy image
 *       <SplatFrame variant="splat-3">       — hand-drawn cutout frame
 *       <DoodleDots>                         — single curated accent
 *   - The image is wrapped in a `splat-3` (the torn-paper rounded variant —
 *     the calmest of the three) with a soft green backing layer that
 *     peeks out behind it. Same treatment as Hero/CTA — keeps the family.
 *   - Floating "On-call nurse" trust card sits at bottom-left of
 *     the image cluster, mirroring the Hero ratio card's role without
 *     duplicating its style (here: green dot + label + name).
 */

const PILLAR_ICONS = {
  Stethoscope,
  Wind,
  MessageCircleHeart,
};

export default function Wellness() {
  const openTour = useTour();
  return (
    <Section
      id="wellness"
      testId="wellness-section"
      surface="cream"
      size="lg"
    >
      {/* Very soft warm ambient glow — single source, low intensity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[28rem] bg-[radial-gradient(55%_42%_at_72%_18%,rgba(34,197,94,0.10)_0%,transparent_70%)]"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* ─────────── Copy column ─────────── */}
          <div className="relative">
            <Eyebrow color="green">{WELLNESS.eyebrow}</Eyebrow>

            <h2 className="mt-5 font-poppins font-bold leading-[1.04] tracking-tight text-brand-ink"
                style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.25rem)" }}>
              {WELLNESS.title_lead}{" "}
              <span className="relative inline-block text-brand-green">
                {WELLNESS.title_emphasis}
              </span>
              {WELLNESS.title_tail}
            </h2>

            <p className="mt-7 max-w-xl text-pretty text-[1.0625rem] leading-[1.7] text-brand-ink/70 md:text-[1.1rem]">
              {WELLNESS.lede}
            </p>

            {/* Pillar list — editorial blocks, not cards. Single accent each. */}
            <ul className="mt-12 space-y-7">
              {WELLNESS.pillars.map((p) => {
                const Icon = PILLAR_ICONS[p.icon];
                return (
                  <li
                    key={p.title}
                    data-testid={p.testId}
                    className="group flex gap-5"
                  >
                    <span
                      className="mt-0.5 inline-flex h-12 w-12 flex-none items-center justify-center rounded-full transition-transform duration-500 ease-soft group-hover:-translate-y-0.5"
                      style={{
                        backgroundColor: `${p.accent}1A`, // 10% tint
                        color: p.accent,
                      }}
                      aria-hidden
                    >
                      {Icon ? <Icon size={20} strokeWidth={2.4} /> : null}
                    </span>
                    <div>
                      <h3 className="font-poppins text-[1.15rem] font-semibold leading-tight text-brand-ink">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-[1.7] text-brand-ink/65">
                        {p.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-11">
              <button
                type="button"
                onClick={openTour}
                data-testid="wellness-cta"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-ink px-7 py-4 text-base font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02] hover:bg-brand-orange hover:shadow-soft-lg"
                aria-label="Open tour information"
              >
                {WELLNESS.cta}
                <ArrowRight
                  size={17}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>

          {/* ─────────── Visual column ─────────── */}
          <div className="relative mx-auto h-[460px] w-full max-w-[520px] sm:h-[540px] lg:h-[600px]">
            {/* Soft green backing dot — depth, not decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full bg-brand-green/15 blur-[70px]"
            />
            {/* Second cream-warm gradient near the bottom — layered depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 bottom-8 h-44 w-44 rounded-full bg-brand-yellow/15 blur-[60px]"
            />

            {/* Restrained doodle — a single dot cluster. No starbursts, no curls. */}
            <DoodleDots
              className="absolute -top-3 left-6 h-3.5 w-10 motion-safe:animate-float-slow"
              color="#22C55E"
            />

            {/* Main framed image — splat-3 (calmest variant) + green backing */}
            <SplatFrame
              variant="splat-3"
              backingClass="bg-brand-green/30"
              backingOffset="translate-x-4 translate-y-4"
              className="absolute inset-0"
            >
              <div className="image-warm h-full w-full">
                <SmartImage
                  source={IMAGES.wellness}
                  sizes="(min-width: 1024px) 36vw, 88vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </SplatFrame>

            {/* Floating trust card — bottom-left of image cluster */}
            <div
              data-testid="wellness-trust-card"
              className="absolute -bottom-4 left-2 hidden max-w-[245px] rounded-2xl bg-white px-5 py-4 ring-soft motion-safe:animate-float-slower sm:block"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">
                <span
                  className="relative inline-flex h-1.5 w-1.5"
                  aria-hidden
                >
                  <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-brand-green opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-green" />
                </span>
                {WELLNESS.trust_card.label}
              </div>
              <div className="mt-2 font-poppins text-[1.05rem] font-semibold leading-snug text-brand-ink">
                {WELLNESS.trust_card.name}
              </div>
              <div className="mt-0.5 text-[13px] leading-snug text-brand-ink/70">
                {WELLNESS.trust_card.role}
              </div>
            </div>

            {/* Small editorial certification chip — top-right of image */}
            <div
              data-testid="wellness-cert-chip"
              className="absolute right-3 top-6 hidden items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink/75 shadow-soft backdrop-blur md:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden />
              {WELLNESS.trust_card.cert}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
