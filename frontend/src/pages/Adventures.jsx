import React from "react";
import { Sun, Map, Sparkles, Leaf, Compass } from "lucide-react";
import { toast } from "sonner";
import { Section, Container, SectionHeader, Eyebrow } from "../components/ui/Section";
import PageHero from "../components/page/PageHero";
import Button from "../components/ui/Button";
import SmartImage from "../components/ui/SmartImage";
import { SplatFrame, DoodleCurl } from "../components/decor/Splat";
import PageMeta from "../components/PageMeta";
import { ADVENTURES, IMAGES, BRAND } from "../data/content";
import { useEnroll } from "../components/layout/SiteLayout";

/**
 * Adventures page — editorial travel-journal meets premium children's brand.
 *
 * Layout flow: PageHero → Intro → Four-pillar grid (with images) →
 *  Seasonal timeline (with color-coded chapter cards) → Future-adventures
 *  note → CTA.
 *
 * Image-rich, but each image is restrained inside a splat or rounded card.
 * Color usage is deliberate per season: green spring, yellow summer, orange
 * autumn, blue winter.
 */

const PILLAR_ICONS = { Sun, Map, Sparkles, Leaf };
const PILLAR_IMAGES = [IMAGES.gallery.g4, IMAGES.gallery.g6, IMAGES.gallery.g5, IMAGES.gallery.g2];

export default function Adventures() {
  const openEnroll = useEnroll();
  const a = ADVENTURES;

  const handleAdventureIdeaClick = async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(BRAND.email);
        toast.success(`Copied ${BRAND.email} to your clipboard`);
      } catch {
        // Clipboard write failed (e.g. permissions) — the mailto href below still applies.
      }
    }
  };

  return (
    <>
      <PageMeta title={a.meta.title} description={a.meta.description} />
      {/* ─────────── Hero ─────────── */}
      <PageHero
        eyebrow={a.hero.eyebrow}
        eyebrowColor="green"
        titleLead={`${a.hero.title_lead} `}
        titleEmphasis={a.hero.title_emphasis}
        titleTail={a.hero.title_tail}
        emphasisColor="#22C55E"
        lede={a.hero.lede}
        image={IMAGES.gallery.g1}
        splat="splat-1"
        backingClass="bg-brand-green/25"
        testId="adventures-hero"
      >
        <Button variant="primary" onClick={openEnroll}>
          Inquire about admissions
        </Button>
        <Button variant="ghost" href="#calendar" icon="arrow-up-right">
          See this term's journey
        </Button>
      </PageHero>

      {/* ─────────── Intro ─────────── */}
      <Section testId="adventures-intro" size="default">
        <Container size="narrow">
          <SectionHeader
            eyebrow={a.intro.eyebrow}
            title={a.intro.title}
            lede={a.intro.lede}
            align="center"
          />
        </Container>
      </Section>

      {/* ─────────── Four pillars ─────────── */}
      <Section testId="adventures-pillars" surface="white" size="lg">
        <Container>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {a.pillars.map((pillar, i) => {
              const Icon = PILLAR_ICONS[pillar.icon] || Compass;
              const img = PILLAR_IMAGES[i] || IMAGES.gallery.g1;
              return (
                <article
                  key={pillar.title}
                  data-testid={`adventure-pillar-${i}`}
                  className="group flex flex-col"
                >
                  <div className="image-warm relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-cream">
                    <SmartImage
                      source={img}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-soft group-hover:scale-[1.04]"
                    />
                    <span
                      className="absolute left-4 top-4 inline-flex items-center justify-center rounded-full bg-white/95 p-2.5 text-brand-orange shadow-soft backdrop-blur"
                      aria-hidden
                    >
                      <Icon size={16} strokeWidth={2.5} />
                    </span>
                  </div>
                  <h3 className="mt-5 font-poppins text-[1.25rem] font-semibold leading-tight text-brand-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-brand-ink/65">
                    {pillar.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ─────────── Seasonal timeline ─────────── */}
      <Section id="calendar" testId="adventures-calendar" size="lg">
        <Container>
          <SectionHeader
            eyebrow={a.calendar.eyebrow}
            title={a.calendar.title}
            align="split"
          />

          <ol className="relative mt-16 space-y-10 lg:space-y-14">
            {/* Vertical accent line on lg+ */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[7.5rem] top-2 bottom-2 hidden w-px bg-brand-ink/10 lg:block"
            />
            {a.calendar.items.map((item) => (
              <li
                key={item.season}
                data-testid={`adventure-season-${item.season.toLowerCase()}`}
                className="relative grid items-start gap-6 lg:grid-cols-[7.5rem_1fr] lg:gap-12"
              >
                {/* Season label rail */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                  <span
                    className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.season}
                  </span>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-ink/70">
                    {item.date}
                  </span>
                </div>

                <div className="relative rounded-[1.75rem] bg-white p-7 sm:p-9 ring-1 ring-brand-ink/5 transition-all duration-300 ease-soft hover:ring-brand-ink/10 hover:shadow-soft">
                  {/* Color stub on the left */}
                  <span
                    className="absolute -left-1 top-7 hidden h-7 w-2 rounded-full lg:block"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <h3 className="font-poppins text-[1.45rem] font-semibold leading-[1.15] tracking-tight text-brand-ink sm:text-[1.6rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.7] text-brand-ink/70">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ─────────── Future adventures note ─────────── */}
      <Section testId="adventures-future" surface="white" size="lg">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-cream px-8 py-12 sm:px-12 md:px-16">
            <DoodleCurl
              className="absolute right-6 top-6 h-7 w-20 text-brand-orange opacity-70"
              color="#FF6B2C"
            />
            <Eyebrow color="green">{a.future_note.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.5rem]">
              {a.future_note.title}
            </h2>
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
              {a.future_note.lede}
            </p>
            <div className="mt-8">
              <Button
                variant="primary"
                href={`mailto:${BRAND.email}?subject=Adventure idea`}
                onClick={handleAdventureIdeaClick}
              >
                Tell us about your idea
              </Button>
              <p className="mt-3 text-xs text-brand-ink/70">
                Opens your email app — or we'll copy {BRAND.email} to your clipboard.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────── CTA ─────────── */}
      <Section testId="adventures-cta" size="default">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-cream-deep px-8 py-14 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(70% 60% at 50% 0%, rgba(96,165,250,0.22) 0%, transparent 65%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.4rem]">
                Adventures begin at the door.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                We share our full termly calendar with prospective families during admissions. Ask us what's next.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="accent" onClick={openEnroll}>
                  Inquire about admissions
                </Button>
                <Button variant="secondary" to="/philosophy" icon={false}>
                  Read our philosophy
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
