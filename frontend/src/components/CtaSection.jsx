import React from "react";
import { ArrowRight, Mail, Calendar } from "lucide-react";
import { Container } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { IMAGES, BRAND } from "../data/content";
import { SplatFrame, DoodleSmile, DoodleCurl, DoodleBurst } from "./decor/Splat";
import { useAdmissions } from "./layout/SiteLayout";

/**
 * CTA section — pivoted from the previous dark `bg-brand-ink` mesh-gradient
 * tech-promo block to a warm cream invitation panel.
 *
 * Why: the old version was the loudest section on a calm, premium site —
 * dark background, four radial gradient washes, five organic blobs, sparkle
 * stars, and a "Limited spots" countdown pill. That tone fights the
 * Scandinavian/Montessori brand register.
 *
 * The new version is the WARMEST section. Cream-deep panel, a single child
 * portrait clipped in a hand-drawn splat (moodboard-style), 2 buttons,
 * 2 curated doodles. That's it.
 */
export default function CtaSection() {
  const openAdmissions = useAdmissions();
  return (
    <section id="cta" data-testid="cta-section" className="relative py-24 md:py-32">
      <Container size="narrow">
        <div
          className="grain relative overflow-hidden rounded-[2.5rem] bg-brand-cream-deep px-7 py-14 sm:px-12 sm:py-16 md:px-16 md:py-20"
        >
          {/* Very subtle warm radial — replaces the previous 4-color mesh. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-0"
            style={{
              backgroundImage:
                "radial-gradient(80% 60% at 0% 0%, rgba(251,194,71,0.30) 0%, transparent 60%), radial-gradient(60% 60% at 100% 100%, rgba(255,107,44,0.18) 0%, transparent 60%)",
            }}
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            {/* ─── Left: invitation copy ─── */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange shadow-soft ring-1 ring-brand-ink/5">
                <Calendar size={12} strokeWidth={2.5} />
                Fall 2026 enrollment
              </div>

              <h2 className="mt-6 font-poppins text-4xl font-bold leading-[1.04] tracking-tight text-brand-ink sm:text-5xl md:text-[3.4rem]">
                Ready to take the
                <br className="hidden sm:block" /> next step?
              </h2>

              <p
                data-testid="cta-slogan"
                className="mt-4 font-poppins text-base italic font-medium text-brand-orange"
              >
                Where learning blossoms, and adventures begin.
              </p>

              <p className="mt-6 max-w-xl text-pretty text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                Book a private tour of our Hamilton campus or start an
                enrollment inquiry — we'll get back to you within one business day.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={openAdmissions}
                  data-testid="cta-primary-button"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-base font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02] hover:shadow-soft-lg"
                >
                  Schedule a Tour
                  <ArrowRight
                    size={18}
                    strokeWidth={2.5}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
                <a
                  href={`mailto:${BRAND.email}`}
                  data-testid="cta-email-button"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white px-7 py-4 text-base font-semibold text-brand-ink transition-colors duration-300 ease-soft hover:border-brand-ink/30"
                >
                  <Mail size={16} strokeWidth={2.5} className="text-brand-orange" />
                  {BRAND.email}
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink/70">
                <span>Open tours weekly</span>
                <span className="text-brand-orange">●</span>
                <span>1 business-day reply</span>
                <span className="text-brand-orange">●</span>
                <span>No commitment</span>
              </div>
            </div>

            {/* ─── Right: portrait splat (moodboard-style "cutout" child) ─── */}
            <div className="relative mx-auto h-[320px] w-full max-w-[360px] sm:h-[380px] lg:h-[420px]">
              {/* Small floating doodles — 2 total, restrained */}
              <DoodleCurl
                className="absolute -left-6 top-6 h-8 w-20 motion-safe:animate-float-slower"
                color="#FF6B2C"
              />
              <DoodleSmile
                className="absolute -right-2 -top-2 h-6 w-12 motion-safe:animate-float-slow"
                color="#22C55E"
              />
              <DoodleBurst
                className="absolute bottom-4 -right-3 h-5 w-5"
                color="#FBC247"
              />

              <SplatFrame
                variant="splat-2"
                backingClass="bg-brand-green/35"
                backingOffset="-translate-x-3 translate-y-3"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={IMAGES.ctaPortrait}
                    sizes="(min-width: 1024px) 360px, 80vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
