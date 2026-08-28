import React, { useState } from "react";
import {
  Stethoscope, Salad, ShieldCheck, HeartHandshake,
  MessageCircleHeart, Moon, Sparkles
} from "lucide-react";
import { Section, Container, SectionHeader, Eyebrow } from "../components/ui/Section";
import PageHero from "../components/page/PageHero";
import PullQuote from "../components/page/PullQuote";
import Button from "../components/ui/Button";
import SmartImage from "../components/ui/SmartImage";
import ContentModal from "../components/ContentModal";
import PageMeta from "../components/PageMeta";
import { SplatFrame, DoodleDots } from "../components/decor/Splat";
import { WELLNESS_PAGE, IMAGES } from "../data/content";
import { useTour } from "../components/layout/SiteLayout";

/**
 * Wellness & Care page — the deeper, dedicated page.
 *
 * Distinct from the homepage <Wellness /> section: that one is the 60-second
 * teaser. This one walks visitors through every dimension of how we look
 * after children — health support, philosophy, nutrition, safety, rest,
 * communication, policies.
 *
 * Visual register: more green than orange, very restrained doodles, soft
 * cream throughout, the most "wellness brand" surface of the site.
 */
export default function Wellness() {
  const [rhythmOpen, setRhythmOpen] = useState(false);
  const openTour = useTour();
  const w = WELLNESS_PAGE;

  const rhythmModalSections = [
    {
      title: "Arrival",
      text: "Families arrive between 7:30 and 9:00. Children hang their bag, say hello, and join a calm welcome activity with a teacher by their side.",
    },
    {
      title: "Outdoor play",
      text: "Morning time often begins outside — fresh air, garden discovery, or a short neighbourhood walk. Movement is gentle and choice-driven.",
    },
    {
      title: "Circle time",
      text: "A short gathering of songs, stories, and simple invitations. The rhythm is steady, not loud, so every child can feel held.",
    },
    {
      title: "Meals & snacks",
      text: "Children eat foods from home at calm, adult-supported tables. We support allergy-aware packing, shared habits, and easy hydration throughout the day.",
    },
    {
      title: "Quiet / rest time",
      text: "After lunch the room softens. Some children nap, others read or settle with quiet materials, all under gentle supervision.",
    },
    {
      title: "Pickup rhythm",
      text: "The last hour blends open play and reflection, so children can leave settled and connected to their grown-up again.",
    },
  ];

  return (
    <>
      <PageMeta title={w.meta.title} description={w.meta.description} />
      {/* ─────────── Hero ─────────── */}
      <PageHero
        eyebrow={w.hero.eyebrow}
        eyebrowColor="green"
        titleLead={`${w.hero.title_lead} `}
        titleEmphasis={w.hero.title_emphasis}
        titleTail={w.hero.title_tail}
        emphasisColor="#22C55E"
        lede={w.hero.lede}
        image={IMAGES.wellness}
        splat="splat-3"
        backingClass="bg-brand-green/25"
        testId="wellness-hero"
      >
        <Button
          variant="primary"
          onClick={openTour}
          aria-label="Open tour information"
        >
          Schedule a wellness tour
        </Button>
        <Button variant="secondary" icon={false} onClick={() => setRhythmOpen(true)}>
          See our daily rhythm
        </Button>
      </PageHero>

      {/* ─────────── On-call health support ─────────── */}
      <Section id="pediatrician" testId="wellness-pediatrician" surface="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            {/* Image */}
            <div className="relative mx-auto h-[460px] w-full max-w-[520px] sm:h-[540px] lg:h-[600px]">
              <DoodleDots
                className="absolute -top-3 -left-2 h-3.5 w-10 motion-safe:animate-float-slow"
                color="#22C55E"
              />
              <SplatFrame
                variant="splat-2"
                backingClass="bg-brand-green/25"
                backingOffset="-translate-x-3 translate-y-3"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={IMAGES.wellness}
                    sizes="(min-width: 1024px) 40vw, 88vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>

              {/* Floating credential card */}
              <div
                data-testid="pediatrician-card"
                className="absolute -bottom-6 right-2 hidden max-w-[270px] rounded-2xl bg-white px-5 py-4 ring-soft motion-safe:animate-float-slower sm:block"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">
                  <Stethoscope size={14} strokeWidth={2.4} />
                  On-call nurse
                </div>
                <div className="mt-2 font-poppins text-[1.05rem] font-semibold leading-snug text-brand-ink">
                  Lena Trott
                </div>
                <div className="mt-0.5 text-[13px] leading-snug text-brand-ink/70">
                  Registered Nurse · Bermuda licensed
                </div>
              </div>
            </div>

            {/* Copy */}
            <div>
              <Eyebrow color="green">{w.pediatrician.eyebrow}</Eyebrow>
              <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {w.pediatrician.title}
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {w.pediatrician.lede}
              </p>
              <ul className="mt-9 space-y-3.5">
                {w.pediatrician.bullets.map((line, i) => (
                  <li key={i} className="flex gap-3 text-[1rem] leading-[1.6] text-brand-ink/80">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-green" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>

              {/* Credential strip */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {w.pediatrician.credential_cards.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-2xl bg-brand-cream px-4 py-3.5 ring-1 ring-brand-ink/5"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink/70">
                      {c.label}
                    </div>
                    <div className="mt-1 font-poppins text-sm font-semibold leading-snug text-brand-ink">
                      {c.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── Wellness philosophy (centred lede + pull quote feel) ─────────── */}
      <Section testId="wellness-philosophy" size="default">
        <Container size="narrow">
          <SectionHeader
            eyebrow={w.philosophy.eyebrow}
            title={w.philosophy.title}
            lede={w.philosophy.lede}
            align="center"
          />
        </Container>
      </Section>

      {/* ─────────── Nutrition ─────────── */}
      <Section id="nutrition" testId="wellness-nutrition" surface="white" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <span className="mt-1 inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange" aria-hidden>
              <Salad size={20} strokeWidth={2.4} />
            </span>
            <div>
              <Eyebrow color="orange">{w.nutrition.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {w.nutrition.title}
              </h2>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {w.nutrition.lede}
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-3">
            {w.nutrition.pillars.map((pillar) => (
              <article key={pillar.title} className="group flex flex-col">
                <h3 className="font-poppins text-[1.2rem] font-semibold leading-tight text-brand-ink">
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

      {/* ─────────── Pull quote ─────────── */}
      <PullQuote
        quote="A well-fed, well-rested, well-loved child can do anything we ask of them."
        emphasis="well-loved"
        author="Lena Trott"
        context="On-call health support"
        size="md"
        align="center"
      />

      {/* ─────────── Safety & hygiene ─────────── */}
      <Section id="safety" testId="wellness-safety" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <span className="mt-1 inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue" aria-hidden>
              <ShieldCheck size={20} strokeWidth={2.4} />
            </span>
            <div>
              <Eyebrow color="blue">{w.safety.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {w.safety.title}
              </h2>
            </div>
          </div>
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:gap-8">
            {w.safety.bullets.map((line, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-[1.75rem] bg-white p-7 ring-1 ring-brand-ink/5"
              >
                <span className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-blue/15 font-poppins text-[12px] font-bold text-brand-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[1.0125rem] leading-[1.65] text-brand-ink/85">
                  {line}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ─────────── Rest & calm spaces ─────────── */}
      <Section id="rest" testId="wellness-rest" surface="white" size="lg">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-yellow/15 text-[#E5A82E]" aria-hidden>
                  <Moon size={19} strokeWidth={2.4} />
                </span>
                <Eyebrow color="orange">{w.rest.eyebrow}</Eyebrow>
              </div>
              <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {w.rest.title}
              </h2>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {w.rest.lede}
              </p>
            </div>
            <div className="relative mx-auto h-[360px] w-full max-w-[460px] sm:h-[420px] lg:h-[460px]">
              <SplatFrame
                variant="splat-1"
                backingClass="bg-brand-yellow/30"
                backingOffset="-translate-x-3 translate-y-3"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={IMAGES.environment}
                    sizes="(min-width: 1024px) 35vw, 86vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── Communication ─────────── */}
      <Section id="communication" testId="wellness-communication" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <span className="mt-1 inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange" aria-hidden>
              <MessageCircleHeart size={20} strokeWidth={2.4} />
            </span>
            <div>
              <Eyebrow color="orange">{w.communication.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {w.communication.title}
              </h2>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                {w.communication.lede}
              </p>
            </div>
          </div>

          <ol className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {w.communication.steps.map((step, i) => (
              <li key={step.title} className="flex flex-col">
                <span className="font-poppins text-[2.25rem] font-bold leading-none text-brand-orange/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-poppins text-[1.15rem] font-semibold leading-tight text-brand-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-brand-ink/65">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ─────────── Health policies ─────────── */}
      <Section id="policies" testId="wellness-policies" surface="white" size="lg">
        <Container size="narrow">
          <SectionHeader
            eyebrow={w.policies.eyebrow}
            title={w.policies.title}
            align="center"
          />
          <div className="mx-auto mt-14 max-w-3xl divide-y divide-brand-ink/10 border-y border-brand-ink/10">
            {w.policies.items.map((item, i) => (
              <details
                key={i}
                name="wellness-policies"
                className="group py-6 [&_summary]:cursor-pointer"
                data-testid={`policy-item-${i}`}
              >
                <summary className="flex items-center justify-between gap-6 font-poppins text-[1.05rem] font-semibold tracking-tight text-brand-ink list-none">
                  <span className="group-open:text-brand-orange">{item.q}</span>
                  <span className="font-light text-2xl text-brand-ink/60 transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 pr-10 text-[15.5px] leading-[1.75] text-brand-ink/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────── Teacher-care closing ─────────── */}
      <Section testId="wellness-educators" size="default">
        <Container size="narrow">
          <div className="rounded-[2rem] bg-brand-cream-soft p-8 sm:p-12 md:p-14">
            <div className="flex items-start gap-4">
              <span className="mt-1 inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange" aria-hidden>
                <Sparkles size={19} strokeWidth={2.4} />
              </span>
              <div>
                <Eyebrow color="orange">Teacher care</Eyebrow>
                <h2 className="mt-3 font-poppins text-3xl font-bold leading-[1.06] tracking-tight text-brand-ink sm:text-[2.4rem]">
                  Looked-after teachers look after children.
                </h2>
                <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                  We pay our educators well, give them generous prep time, fund their professional development, and treat their wellbeing as the foundation of yours. A school is only as steady as its grown-ups.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── CTA ─────────── */}
      <Section testId="wellness-cta" size="default">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-cream-deep px-8 py-14 text-center sm:px-12 sm:py-16 md:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(70% 60% at 50% 0%, rgba(34,197,94,0.22) 0%, transparent 65%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.4rem]">
                Care worth feeling for yourself.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                Visit our Hamilton campus, meet our care team, and ask the hard questions. We're built for it.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="accent"
                  onClick={openTour}
                  aria-label="Open tour information"
                >
                  Schedule a wellness tour
                </Button>
                <Button variant="secondary" to="/parents" icon={false}>
                  Practical parent info
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <ContentModal
        open={rhythmOpen}
        onOpenChange={setRhythmOpen}
        title="A calm day at Tiny Explorers"
        lede="A sample rhythm that shows how arrival, play, meals, rest, and pickup can feel warm, predictable, and grounded in everyday preschool life."
        sections={rhythmModalSections}
        testId="wellness-rhythm-modal"
      />
    </>
  );
}
