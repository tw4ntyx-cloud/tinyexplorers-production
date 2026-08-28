import React, { useState } from "react";
import { Clock, Users, Sun, Backpack, Salad, MessageSquare, ShieldCheck } from "lucide-react";
import { Section, Container, SectionHeader, Eyebrow } from "../components/ui/Section";
import PageHero from "../components/page/PageHero";
import FAQ from "../components/page/FAQ";
import Button from "../components/ui/Button";
import AdmissionsModal from "../components/AdmissionsModal";
import PageMeta from "../components/PageMeta";
import { PARENTS, IMAGES, PARENT_POLICIES, BRAND } from "../data/content";
import { useTour } from "../components/layout/SiteLayout";

/**
 * Parents page — minimal premium information architecture.
 *
 * Every section here answers a real practical question, and is laid out
 * with calm precision: clean tables for hours / ratios, an editorial
 * timeline for the daily schedule, simple bulleted lists for the packing
 * list and meals, structured cards for communication & safety, and a
 * full FAQ via the shared <FAQ> primitive.
 */

const SECTION_ICONS = {
  hours: Clock,
  age_groups: Users,
  schedule: Sun,
  bring: Backpack,
  meals: Salad,
  communication: MessageSquare,
  safety: ShieldCheck,
};

function IconBadge({ Icon, color = "#FF6B2C" }) {
  return (
    <span
      className="mt-1 inline-flex h-11 w-11 flex-none items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}1A`, color }}
      aria-hidden
    >
      <Icon size={19} strokeWidth={2.4} />
    </span>
  );
}

export default function Parents() {
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const openTour = useTour();
  const p = PARENTS;

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
        image={IMAGES.environment}
        splat="splat-2"
        backingClass="bg-brand-yellow/25"
        testId="parents-hero"
      >
        <Button variant="primary" onClick={() => setAdmissionsOpen(true)}>
          Begin admissions
        </Button>
        <Button variant="ghost" asChild>
          <a
            href="#faq"
            onClick={(event) => {
              event.preventDefault();
              const target = document.getElementById("faq");
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.pushState(null, "", "#faq");
              } else {
                window.location.hash = "#faq";
              }
            }}
          >
            Jump to FAQ
          </a>
        </Button>
      </PageHero>

      <AdmissionsModal
        open={admissionsOpen}
        onOpenChange={setAdmissionsOpen}
      />

      {/* ─────────── Operating hours ─────────── */}
      <Section id="hours" testId="parents-hours" surface="white" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.hours} color="#FF6B2C" />
            <div>
              <Eyebrow color="orange">{p.hours.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.hours.title}
              </h2>
            </div>
          </div>
          <dl className="mt-12 divide-y divide-brand-ink/10 border-y border-brand-ink/10">
            {p.hours.items.map((row) => (
              <div
                key={row.label}
                className="grid items-start gap-3 py-5 sm:grid-cols-[1fr_1.5fr] sm:gap-10"
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink/70 sm:text-[12px]">
                  {row.label}
                </dt>
                <dd className="font-poppins text-[1.05rem] font-semibold leading-snug text-brand-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* ─────────── Age groups ─────────── */}
      <Section id="ages" testId="parents-ages" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.age_groups} color="#22C55E" />
            <div>
              <Eyebrow color="green">{p.age_groups.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.age_groups.title}
              </h2>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.age_groups.items.map((g) => (
              <article
                key={g.name}
                className="rounded-3xl bg-white p-6 ring-1 ring-brand-ink/5"
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                  {g.age}
                </div>
                <h3 className="mt-2 font-poppins text-[1.2rem] font-semibold leading-tight text-brand-ink">
                  {g.name}
                </h3>
                <div className="mt-5 flex items-center gap-2 text-sm text-brand-ink/65">
                  <span className="font-poppins text-base font-bold text-brand-ink">{g.ratio}</span>
                  <span>educator : children</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────── A typical day ─────────── */}
      <Section id="schedule" testId="parents-schedule" surface="white" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.schedule} color="#E5A82E" />
            <div>
              <Eyebrow color="orange">{p.schedule.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.schedule.title}
              </h2>
            </div>
          </div>

          <ol className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {p.schedule.items.map((item, i) => (
              <li key={i} className="flex gap-5">
                <span className="font-poppins text-[1.3rem] font-bold leading-tight text-brand-orange/80 whitespace-nowrap">
                  {item.time}
                </span>
                <div>
                  <h3 className="font-poppins text-[1.1rem] font-semibold leading-tight text-brand-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.7] text-brand-ink/65">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ─────────── What to bring ─────────── */}
      <Section id="bring" testId="parents-bring" size="lg">
        <Container size="narrow">
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.bring} color="#60A5FA" />
            <div>
              <Eyebrow color="blue">{p.bring.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.bring.title}
              </h2>
            </div>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {p.bring.items.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-brand-ink/5"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-blue" aria-hidden />
                <span className="text-[15.5px] leading-[1.65] text-brand-ink/85">{line}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ─────────── Communication ─────────── */}
      <Section id="communication" testId="parents-communication" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.communication} color="#FF6B2C" />
            <div>
              <Eyebrow color="orange">{p.communication.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                {p.communication.title}
              </h2>
            </div>
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {p.communication.items.map((item, i) => (
              <article key={item.title} className="flex flex-col">
                <span className="font-poppins text-[2.25rem] font-bold leading-none text-brand-orange/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-poppins text-[1.1rem] font-semibold leading-tight text-brand-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-brand-ink/65">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────── Safety ─────────── */}
      <Section id="safety" testId="parents-safety" surface="white" size="lg">
        <Container>
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.safety} color="#60A5FA" />
            <div>
              <Eyebrow color="blue">Safety procedures</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                Quietly thorough.
              </h2>
            </div>
          </div>
          <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:gap-8">
            {[
              { title: "Secure entry", body: "Keycard access. Front desk staffed continuously." },
              { title: "Trained adults", body: "Every staff member background-checked, first-aid certified, re-trained annually." },
              { title: "Practiced drills", body: "Fire, hurricane, and lockdown drills run termly — calmly and child-appropriately." },
              { title: "On-site first aid", body: "Two qualified first-aiders on duty during all school hours." },
            ].map((item) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-[1.75rem] bg-brand-cream p-7 ring-1 ring-brand-ink/5"
              >
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-brand-blue" aria-hidden />
                <div>
                  <h3 className="font-poppins text-[1.05rem] font-semibold leading-tight text-brand-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.7] text-brand-ink/65">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ─────────── Policies hub ─────────── */}
      <Section id="policies" testId="parents-policies" surface="white" size="lg">
        <Container size="narrow">
          <div className="flex items-start gap-4">
            <IconBadge Icon={SECTION_ICONS.safety} color="#FF6B2C" />
            <div>
              <Eyebrow color="orange">Parent Information & Policies</Eyebrow>
              <h2 className="mt-3 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                The practical guidance that supports everyday family life.
              </h2>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                Use this page as the hub for the policies and guidance that shape how we care for children, communicate with families, and keep routines calm and consistent.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PARENT_POLICIES.map((policy) => (
              <article
                key={policy.slug}
                className="flex h-full flex-col rounded-3xl border border-brand-ink/10 bg-white p-6 shadow-soft"
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                  {policy.category}
                </div>
                <h3 className="mt-3 font-poppins text-[1.2rem] font-semibold leading-tight text-brand-ink">
                  {policy.title}
                </h3>
                <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-brand-ink/70">
                  {policy.summary}
                </p>
                <Button
                  variant="secondary"
                  to={`/policies/${policy.slug}`}
                  icon="arrow-up-right"
                  className="mt-6 self-start"
                >
                  Read Policy
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────── Careers ─────────── */}
      <Section id="careers" testId="parents-careers" size="lg">
        <Container size="narrow" className="text-center">
          <Eyebrow color="orange" className="justify-center">
            Careers
          </Eyebrow>
          <h2 className="mt-3 font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-4xl">
            Join our team.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-[1.6] text-brand-ink/70 sm:text-[1.0625rem] sm:leading-[1.7]">
            We're always glad to hear from educators and caregivers who share
            our approach to early childhood. Send us your resume and a note
            about what draws you to Tiny Explorers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="accent" href={`mailto:${BRAND.email}?subject=Careers%20at%20Tiny%20Explorers`} icon={false}>
              Email us your resume
            </Button>
          </div>
        </Container>
      </Section>

      {/* ─────────── FAQ ─────────── */}
      <FAQ
        id="faq"
        testId="parents-faq"
        eyebrow={p.faq.eyebrow}
        title={p.faq.title}
        items={p.faq.items}
        surface="cream"
      />

      {/* ─────────── CTA ─────────── */}
      <Section testId="parents-cta" size="default">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-cream-deep px-8 py-14 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(70% 60% at 50% 0%, rgba(251,194,71,0.28) 0%, transparent 65%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-[2.4rem]">
                Still have a question?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/70">
                We answer every parent email within one business day — usually faster. Or just come in.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="accent"
                  onClick={openTour}
                  aria-label="Open tour information"
                >
                  Book a campus tour
                </Button>
                <Button variant="secondary" onClick={() => setAdmissionsOpen(true)} icon={false}>
                  Begin admissions
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
