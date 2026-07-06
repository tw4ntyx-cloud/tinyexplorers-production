import React from "react";
import { Shield, HeartHandshake, Blocks, Sprout } from "lucide-react";
import { Section, Container, SectionHeader } from "./ui/Section";

/**
 * Features — moodboard-aligned editorial blocks.
 *
 * Previous version: 4 white cards with borders, shadows, "01/02/03/04"
 * numerals in the corner, sparkle badges floating on icons, and a hover-
 * progress bar at the bottom. Too much UI chrome for a calm, premium brand.
 *
 * New version: icon disc + title + two-line description, sitting directly
 * on cream. The only "card-ness" is a soft hover halo. The icon discs are
 * the entire color story for this section — one of the four brand colors
 * per item, used confidently and without dilution.
 */

const FEATURES = [
  {
    icon: Shield,
    title: "Safe & Secure",
    desc: "Keycard entry, low ratios, and daily safety walkthroughs — peace of mind is part of the curriculum.",
    accent: "#FF6B2C",
    bg: "#FFE4D3",
    testId: "feature-safe",
  },
  {
    icon: HeartHandshake,
    title: "Caring Educators",
    desc: "Certified early-years teachers who learn each child's rhythm and meet them with patience and warmth.",
    accent: "#22C55E",
    bg: "#DEF7E5",
    testId: "feature-educators",
  },
  {
    icon: Blocks,
    title: "Play-Based Learning",
    desc: "Reggio and Montessori-inspired environments where curiosity, language, and motor skills bloom naturally.",
    accent: "#60A5FA",
    bg: "#E1ECFF",
    testId: "feature-play",
  },
  {
    icon: Sprout,
    title: "Growing Together",
    desc: "Weekly notes, parent workshops, and an open-door studio — because family is the first classroom.",
    accent: "#E5A82E",
    bg: "#FFEFC8",
    testId: "feature-family",
  },
];

export default function Features() {
  return (
    <Section id="approach" testId="features-section" size="lg">
      <Container>
        <SectionHeader
          eyebrow="Why families choose us"
          title="A calm, confident start — designed around your child."
          lede="Every detail at Tiny Explorers is shaped by research in early development and the lived experience of Bermuda families. The result is a school that feels like home — only a little more wonderful."
        />

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              data-testid={f.testId}
              className="group relative flex flex-col"
            >
              {/* Icon disc — circular, generous, single accent per card */}
              <div
                className="relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform duration-500 ease-soft group-hover:-translate-y-1"
                style={{ backgroundColor: f.bg, color: f.accent }}
              >
                <f.icon size={30} strokeWidth={2.4} />
              </div>

              <h3 className="mt-7 font-poppins text-[1.3rem] font-semibold leading-tight text-brand-ink">
                {f.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-brand-ink/70">
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
