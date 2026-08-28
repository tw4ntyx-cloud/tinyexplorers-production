import React from "react";
import { Calendar, Mail, MapPin } from "lucide-react";

import PageHero from "../components/page/PageHero";
import FAQ from "../components/page/FAQ";
import PullQuote from "../components/page/PullQuote";
import { Section, Container, SectionHeader, Eyebrow } from "../components/ui/Section";
import Button from "../components/ui/Button";
import SmartImage from "../components/ui/SmartImage";
import { SplatFrame, DoodleSmile } from "../components/decor/Splat";
import PageMeta from "../components/PageMeta";

import { ADMISSIONS, IMAGES, BRAND, TOUR_BOOKING } from "../data/content";
import { useInquiry } from "../components/layout/SiteLayout";

/**
 * Admissions page.
 *
 * Tone: "luxury private school admissions meets boutique hospitality
 * onboarding." Unhurried, transparent, warm. The implicit promise of the
 * page is that the school itself feels the way the page feels.
 *
 * Composition:
 *   1. PageHero with both Inquire + Tour CTAs.
 *   2. ProcessSteps — the four-step admissions journey as numbered editorial
 *      blocks (Inquire → Visit → Apply → Welcome). Numbers are display-numerals,
 *      not pill badges — keeps the editorial register.
 *   3. Visit block — split layout: copy + tour-time list on the left, framed
 *      image on the right. The single most-converting block on the page.
 *   4. Tuition + Waitlist — paired narrow editorial blocks; transparent,
 *      honest, no urgency.
 *   5. PullQuote — a moment of breath.
 *   6. FAQ — the questions admissions asks first.
 *   7. Final CTA — short, intimate close.
 *
 * Color discipline: orange CTAs only at top and bottom. Body of the page
 * stays in cream + ink. The page is intentionally one of the calmest on
 * the site — a parent reading it should feel less stressed, not more.
 */

function ProcessSteps({ steps }) {
  return (
    <Section id="process" testId="admissions-process" surface="white" size="lg">
      <Container>
        <SectionHeader eyebrow={steps.eyebrow} title={steps.title} align="center" />

        <ol className="mx-auto mt-16 grid max-w-5xl gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.items.map((step, i) => (
            <li
              key={step.title}
              data-testid={`admissions-step-${i + 1}`}
              className="relative"
            >
              {/* Display numeral — editorial, not a circle-badge */}
              <div className="display-numeral text-[5rem] leading-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-poppins text-[1.25rem] font-semibold leading-tight text-brand-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.7] text-brand-ink/65">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function VisitBlock({ visit }) {
  return (
    <Section id="visit" testId="admissions-visit" size="lg">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Copy */}
          <div>
            <Eyebrow color="green">{visit.eyebrow}</Eyebrow>
            <h2
              className="mt-5 font-poppins font-bold leading-[1.04] tracking-tight text-brand-ink"
              style={{ fontSize: "clamp(2rem, 4.2vw, 3rem)" }}
            >
              {visit.title}
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-[1.05rem] leading-[1.7] text-brand-ink/70">
              {visit.lede}
            </p>

            <ul className="mt-8 space-y-3 text-[15.5px] text-brand-ink/80">
              {visit.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Calendar
                    size={17}
                    strokeWidth={2.4}
                    className="mt-0.5 flex-none text-brand-orange"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                variant="accent"
                size="lg"
                href={TOUR_BOOKING.url}
                testId="admissions-book-tour"
                aria-label="Book a 30-minute nursery tour with Google Calendar"
              >
                Book a tour
              </Button>
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink/75 hover:text-brand-ink"
              >
                <Mail size={15} strokeWidth={2.5} className="text-brand-orange" />
                or email {BRAND.email}
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[520px] lg:h-[560px]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 h-48 w-48 rounded-full bg-brand-orange/15 blur-[60px]"
            />
            <DoodleSmile
              className="absolute -top-2 left-8 h-6 w-12 motion-safe:animate-float-slow"
              color="#22C55E"
            />
            <SplatFrame
              variant="splat-1"
              backingClass="bg-brand-orange/25"
              backingOffset="translate-x-4 translate-y-4"
              className="absolute inset-0"
            >
              <div className="image-warm h-full w-full">
                <SmartImage
                  source={IMAGES.heroAccent}
                  sizes="(min-width: 1024px) 42vw, 88vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </SplatFrame>

            {/* Floating address card */}
            <div
              data-testid="admissions-address-card"
              className="absolute -bottom-3 left-3 hidden max-w-[260px] rounded-2xl bg-white px-5 py-4 ring-soft motion-safe:animate-float-slower sm:block"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                <MapPin size={13} strokeWidth={2.5} />
                Visit us
              </div>
              <div className="mt-1.5 font-poppins text-[1rem] font-semibold leading-snug text-brand-ink">
                {TOUR_BOOKING.location}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function TuitionWaitlist({ tuition, waitlist }) {
  return (
    <Section id="tuition" testId="admissions-tuition-waitlist" surface="white" size="lg">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{tuition.eyebrow}</Eyebrow>
            <h3
              className="mt-5 font-poppins font-bold leading-[1.06] tracking-tight text-brand-ink"
              style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}
            >
              {tuition.title}
            </h3>
            <p className="mt-5 text-pretty text-[1.05rem] leading-[1.75] text-brand-ink/70">
              {tuition.lede}
            </p>
          </div>

          <div>
            <Eyebrow color="green">{waitlist.eyebrow}</Eyebrow>
            <h3
              className="mt-5 font-poppins font-bold leading-[1.06] tracking-tight text-brand-ink"
              style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}
            >
              {waitlist.title}
            </h3>
            <p className="mt-5 text-pretty text-[1.05rem] leading-[1.75] text-brand-ink/70">
              {waitlist.lede}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ClosingCta({ onInquiry }) {
  return (
    <Section testId="admissions-closing" size="default">
      <Container size="narrow">
        <div className="rounded-[2.5rem] bg-brand-cream-deep px-8 py-14 text-center sm:px-14 sm:py-16">
          <h2 className="mx-auto max-w-2xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.4rem]">
            When you're ready, we're here.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-[1.7] text-brand-ink/70">
            Start an inquiry, or book a 30-minute tour online when you are ready to visit.
            We answer every message ourselves — usually within one business day.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button variant="accent" size="lg" onClick={onInquiry}>
              Start an inquiry
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href={TOUR_BOOKING.url}
              icon="arrow-up-right"
              aria-label="Book a 30-minute nursery tour with Google Calendar"
            >
              Book a tour
            </Button>
            <Button variant="secondary" size="lg" href={`mailto:${BRAND.email}`} icon={false}>
              {BRAND.email}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default function Admissions() {
  const openInquiry = useInquiry();
  const { hero, steps, visit, tuition, waitlist, faq, meta } = ADMISSIONS;

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />
      <PageHero
        eyebrow={hero.eyebrow}
        eyebrowColor="orange"
        titleLead={`${hero.title_lead} `}
        titleEmphasis={hero.title_emphasis}
        titleTail={hero.title_tail}
        emphasisColor="#FF6B2C"
        lede={hero.lede}
        image={IMAGES.ctaPortrait}
        splat="splat-2"
        backingClass="bg-brand-orange/22"
        testId="admissions-hero"
      >
        <Button variant="accent" size="lg" onClick={openInquiry} testId="admissions-hero-inquire">
          {hero.cta_primary}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          href={TOUR_BOOKING.url}
          icon="arrow-up-right"
          aria-label="Book a 30-minute nursery tour with Google Calendar"
        >
          {hero.cta_secondary}
        </Button>
      </PageHero>

      <ProcessSteps steps={steps} />

      <VisitBlock visit={visit} />

      <TuitionWaitlist tuition={tuition} waitlist={waitlist} />

      <PullQuote
        quote="We'd rather have the right family at a fair price than the wrong family at full price."
        emphasis="right family"
        author="Tiny Explorers Admissions"
        align="center"
        size="md"
      />

      <FAQ
        id="faq"
        eyebrow={faq.eyebrow}
        title={faq.title}
        items={faq.items}
        surface="white"
      />

      <ClosingCta onInquiry={openInquiry} />
    </>
  );
}
