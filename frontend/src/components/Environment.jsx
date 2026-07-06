import React from "react";
import { Leaf, Sun, Heart } from "lucide-react";
import { Section, Container, Eyebrow } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { IMAGES } from "../data/content";

const HIGHLIGHTS = [
  {
    icon: Leaf,
    title: "Natural materials",
    desc: "Solid wood, linen, ceramic — surfaces that invite touch and care.",
    color: "#22C55E",
  },
  {
    icon: Sun,
    title: "Daylit studios",
    desc: "South-facing rooms with circadian-aware lighting and acoustic softness.",
    color: "#FBC247",
  },
  {
    icon: Heart,
    title: "Calm by design",
    desc: "Tucked-away reading nooks and quiet corners for every kind of day.",
    color: "#FF6B2C",
  },
];

const STATS = [
  { v: "1 : 4", l: "Teacher to child" },
  { v: "4,200", l: "Square feet" },
  /* Temporarily hidden for launch phase — easy to restore later: */
  /* { v: "12 yrs", l: "Caring for Bermuda" }, */
  { v: "100%", l: "Certified staff" },
];

export default function Environment() {
  return (
    <Section id="environment" testId="environment-section" size="lg">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image side */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-brand-yellow/30 blur-[90px]"
            />
            <div
              aria-hidden
              className="absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-brand-blue/25 blur-[90px]"
            />

            {/* Offset color block */}
            <div
              aria-hidden
              className="absolute -left-6 top-8 h-[520px] w-full blob-4 bg-brand-orange/15"
            />

            <div className="image-warm relative overflow-hidden blob-2 ring-soft">
              <SmartImage
                source={IMAGES.environment}
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="h-[560px] w-full object-cover"
              />
            </div>

            {/* Caption tag */}
            <div className="absolute -bottom-7 right-2 hidden rounded-2xl bg-white px-5 py-4 ring-soft sm:block">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink/70">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                Hamilton Campus
              </div>
              <div className="mt-1 font-poppins text-lg font-semibold text-brand-ink">
                4,200 sq ft of calm.
              </div>
            </div>

            {/* Editorial number marker */}
            <div className="display-numeral absolute -left-2 -top-3 hidden text-[7rem] lg:block" aria-hidden>
              02
            </div>
          </div>

          {/* Copy side */}
          <div>
            <Eyebrow>Our Environment</Eyebrow>
            <h2 className="mt-5 font-poppins text-4xl font-bold leading-[1.04] tracking-tight text-brand-ink sm:text-5xl lg:text-[3.25rem]">
              Spaces that whisper, not shout.
            </h2>
            <p className="mt-7 text-pretty text-lg leading-[1.7] text-brand-ink/65 lg:text-[1.15rem]">
              Our Hamilton campus was co-designed with educators, parents, and
              a pediatric architect. The result: rooms that feel unhurried —
              where children can focus, rest, and wonder out loud.
            </p>

            <ul className="mt-10 space-y-6">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex gap-5">
                  <span
                    className="mt-0.5 inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${h.color}1A`, color: h.color }}
                  >
                    <h.icon size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <div className="font-poppins text-[1.1rem] font-semibold text-brand-ink">
                      {h.title}
                    </div>
                    <div className="mt-1 text-[15px] leading-[1.65] text-brand-ink/65">
                      {h.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Stats row — rebalanced to 3 columns for natural centering after hiding launch stat */}
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-brand-ink/8 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.l} className="bg-brand-cream p-5">
                  <div className="font-poppins text-2xl font-bold leading-none text-brand-ink">
                    {s.v}
                  </div>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/70">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
