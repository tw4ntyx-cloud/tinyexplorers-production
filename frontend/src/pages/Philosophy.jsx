import React, { useState } from "react";
import { Section, Container, SectionHeader, Eyebrow } from "../components/ui/Section";
import PageHero from "../components/page/PageHero";
import PullQuote from "../components/page/PullQuote";
import Button from "../components/ui/Button";
import SmartImage from "../components/ui/SmartImage";
import { SplatFrame, DoodleSmile, DoodleDots } from "../components/decor/Splat";
import ContentModal from "../components/ContentModal";
import PageMeta from "../components/PageMeta";
import { PHILOSOPHY, IMAGES, TOUR_BOOKING } from "../data/content";

/**
 * Philosophy page — editorial storytelling.
 *
 * Layout flow: PageHero → Manifesto (numbered list) → Pull Quote
 *  → Child-led learning (split with image) → Emotional development
 *  → Pull Quote (Einstein) → Play-based learning
 *  → Calm environments → Parent partnership → Closing pull quote → CTA
 *
 * Reuses every existing primitive — Section, Container, SectionHeader,
 * Eyebrow, PageHero, PullQuote, SplatFrame, SmartImage, Button.
 * Carries the orange/green editorial accent throughout; doodles used
 * sparingly (single smile, single dots cluster).
 */
export default function Philosophy() {
  const [wellnessOpen, setWellnessOpen] = useState(false);
  const p = PHILOSOPHY;

  const wellnessModalSections = [
    {
      title: "Emotional wellbeing",
      text: "Children are invited to name their feelings, breathe, and return to the room with help when they need it. Calm moments are part of the learning day, not an interruption.",
    },
    {
      title: "Calm environment",
      text: "Soft light, uncluttered materials, and intentional transitions help every child arrive and move through the day without feeling rushed.",
    },
    {
      title: "Caregiver philosophy",
      text: "Our educators follow presence over pressure. They tune into the child first, then offer gentle invitations that support curiosity, connection, and confidence.",
    },
    {
      title: "Rest and regulation",
      text: "Quiet corners, breathing prompts, and consistent routines help children feel steady. Sleep and rest are honored as part of the daily rhythm.",
    },
    {
      title: "Gentle transitions",
      text: "Arrival, meals, and pickup are paced with predictable cues and warm attention, so children move from one part of the day with ease.",
    },
  ];

  return (
    <>
      <PageMeta title={p.meta.title} description={p.meta.description} />
      {/* ─────────── Hero ─────────── */}
      <PageHero
        eyebrow={p.hero.eyebrow}
        eyebrowColor="orange"
        titleLead={`${p.hero.title_lead} `}
        titleEmphasis={p.hero.title_emphasis}
        titleTail={p.hero.title_tail}
        emphasisColor="#FF6B2C"
        lede={p.hero.lede}
        image={IMAGES.wellness}
        splat="splat-2"
        backingClass="bg-brand-orange/20"
        testId="philosophy-hero"
      >
        <Button
          variant="primary"
          href={TOUR_BOOKING.url}
          testId="philosophy-hero-cta"
          aria-label="Book a 30-minute campus visit with Google Calendar"
        >
          Book a campus visit
        </Button>
        <Button variant="secondary" icon={false} onClick={() => setWellnessOpen(true)}>
          Read about Wellness
        </Button>
      </PageHero>

      {/* ─────────── Manifesto ─────────── */}
      <Section testId="philosophy-manifesto" size="lg">
        <Container>
          <SectionHeader
            eyebrow={p.manifesto.eyebrow}
            title={p.manifesto.title}
            align="center"
          />
          <ol className="mx-auto mt-16 grid max-w-5xl gap-x-12 gap-y-10 md:grid-cols-2">
            {p.manifesto.items.map((line, i) => (
              <li
                key={i}
                data-testid={`manifesto-item-${i + 1}`}
                className="group flex gap-5"
              >
                <span className="font-poppins text-[1.75rem] font-bold leading-none text-brand-orange/80 transition-colors group-hover:text-brand-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[1.05rem] leading-[1.65] text-brand-ink/85">
                  {line}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ─────────── Pull quote 1 ─────────── */}
      <PullQuote
        quote="The child has a hundred languages — drawing, building, dancing, asking, listening, watching the light move across a wall."
        emphasis="a hundred languages"
        author="Inspired by Loris Malaguzzi"
        context="Reggio Emilia philosophy"
        align="center"
      />

      {/* ─────────── Child-led learning ─────────── */}
      <Section id="child-led" testId="philosophy-childled" surface="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            {/* Image left */}
            <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[500px] lg:h-[560px]">
              <DoodleDots
                className="absolute -top-2 -left-2 h-3.5 w-10 motion-safe:animate-float-slow"
                color="#22C55E"
              />
              <SplatFrame
                variant="splat-3"
                backingClass="bg-brand-yellow/25"
                backingOffset="-translate-x-3 translate-y-3"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={IMAGES.environment}
                    sizes="(min-width: 1024px) 40vw, 88vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>
            </div>

            {/* Copy right */}
            <div>
              <Eyebrow color="orange">{p.child_led.eyebrow}</Eyebrow>
              <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.child_led.title}
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {p.child_led.lede}
              </p>
              <ul className="mt-10 space-y-7">
                {p.child_led.pillars.map((pillar, i) => (
                  <li key={pillar.title} className="flex gap-5">
                    <span className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-orange/10 font-poppins text-[12px] font-bold text-brand-orange">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-poppins text-[1.1rem] font-semibold leading-tight text-brand-ink">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-[1.7] text-brand-ink/65">
                        {pillar.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── Emotional development ─────────── */}
      <Section id="emotional" testId="philosophy-emotional" size="lg">
        <Container>
          <SectionHeader
            eyebrow={p.emotional.eyebrow}
            title={p.emotional.title}
            lede={p.emotional.lede}
            align="split"
          />
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:gap-8">
            {p.emotional.bullets.map((line, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-[1.75rem] bg-white/70 p-7 ring-1 ring-brand-ink/5 backdrop-blur"
              >
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-brand-green" aria-hidden />
                <p className="text-[1.0125rem] leading-[1.65] text-brand-ink/85">
                  {line}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ─────────── Play-based learning ─────────── */}
      <Section id="play" testId="philosophy-play" surface="white" size="lg">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <Eyebrow color="green">{p.play.eyebrow}</Eyebrow>
              <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.play.title}
              </h2>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {p.play.lede}
              </p>
            </div>

            {/* Inline pull-quote-lite — section-internal, no extra <Section> */}
            <figure className="self-end">
              <div className="relative overflow-hidden rounded-[2rem] bg-brand-cream-soft p-8 md:p-10">
              <div className="pointer-events-none absolute -top-3 left-4 opacity-50">
                <svg
                  viewBox="0 0 36 28"
                  className="h-4 w-6 text-brand-orange"
                  aria-hidden
                  fill="currentColor"
                >
                  <path d="M14 0 C 6 0, 0 7, 0 16 L 0 28 L 14 28 L 14 16 L 6 16 C 6 12, 9 9, 14 8 Z M 36 0 C 28 0, 22 7, 22 16 L 22 28 L 36 28 L 36 16 L 28 16 C 28 12, 31 9, 36 8 Z" />
                </svg>
              </div>
              <blockquote className="relative mt-4 font-poppins text-[1.45rem] font-medium leading-[1.3] tracking-tight text-brand-ink md:text-[1.65rem]">
                {p.play.quote}
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-brand-ink/65">
                — {p.play.quote_author}
              </figcaption>
            </div>
            </figure>
          </div>
        </Container>
      </Section>

      {/* ─────────── Calm environments ─────────── */}
      <Section id="calm" testId="philosophy-calm" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <div>
              <Eyebrow color="blue">{p.calm.eyebrow}</Eyebrow>
              <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.calm.title}
              </h2>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {p.calm.lede}
              </p>
              <ul className="mt-9 space-y-3.5">
                {p.calm.bullets.map((line, i) => (
                  <li key={i} className="flex gap-3 text-[1rem] leading-[1.6] text-brand-ink/80">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-blue" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[500px] lg:h-[540px]">
              <DoodleSmile
                className="absolute -top-2 right-6 h-6 w-12 motion-safe:animate-float-slower"
                color="#60A5FA"
              />
              <SplatFrame
                variant="splat-1"
                backingClass="bg-brand-blue/25"
                backingOffset="translate-x-4 translate-y-4"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={IMAGES.heroAccent}
                    sizes="(min-width: 1024px) 40vw, 88vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── Parent partnership ─────────── */}
      <Section id="educators" testId="philosophy-partnership" surface="white" size="lg">
        <Container>
          <SectionHeader
            eyebrow={p.partnership.eyebrow}
            title={p.partnership.title}
            lede={p.partnership.lede}
            align="split"
          />
          <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {p.partnership.pillars.map((pillar, i) => (
              <article key={pillar.title} className="group flex flex-col">
                <span className="font-poppins text-[2.5rem] font-bold leading-none text-brand-orange/30 transition-colors group-hover:text-brand-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-poppins text-[1.25rem] font-semibold leading-tight text-brand-ink">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-brand-ink/65">
                  {pillar.desc}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────── Closing pull quote ─────────── */}
      <PullQuote
        quote={p.closing.quote}
        author={p.closing.attribution}
        align="center"
        size="lg"
      />

      {/* ─────────── CTA ─────────── */}
      <Section testId="philosophy-cta" size="default">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-cream-deep px-8 py-14 text-center sm:px-12 sm:py-16 md:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(70% 60% at 50% 0%, rgba(251,194,71,0.30) 0%, transparent 65%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.4rem]">
                Come and feel the calm in person.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                The philosophy is easier to feel than to read. Book a 30-minute tour and experience Tiny Explorers in person.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="accent"
                  href={TOUR_BOOKING.url}
                  aria-label="Book a 30-minute campus visit with Google Calendar"
                >
                  Book a campus visit
                </Button>
                <Button variant="secondary" icon={false} onClick={() => setWellnessOpen(true)}>
                  Explore Wellness & Care
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <ContentModal
        open={wellnessOpen}
        onOpenChange={setWellnessOpen}
        title="Wellness at Tiny Explorers"
        lede="A gentle introduction to how we support children's wellbeing with calm environments, attentive care, and warm routines."
        sections={wellnessModalSections}
        testId="philosophy-wellness-modal"
      />
    </>
  );
}
