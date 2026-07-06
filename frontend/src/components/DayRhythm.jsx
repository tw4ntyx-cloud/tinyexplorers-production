import React, { useState } from "react";
import { Section, Container } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { IMAGES } from "../data/content";

/**
 * DayRhythm — signature immersive section.
 *
 * An editorial, cinematic journey through a single day at Tiny Explorers.
 * Focuses on emotional storytelling, gentle pacing, premium minimalism.
 *
 * Features:
 *  - Poetic headline and context
 *  - Timeline of moments (arrival → play → rest → learning → departure)
 *  - Each moment pairs evocative imagery with warm, emotionally intelligent copy
 *  - Soft scroll-reveal animations
 *  - Premium color and typography
 *  - Authentic classroom storytelling (not generic)
 */

const dayMoments = [
  {
    time: "7:30 AM",
    title: "Arrival",
    subtitle: "A calm welcome",
    copy: "Parents and children arrive to soft music, familiar faces, and an unhurried pace. We believe the transition into the day sets the tone for everything that follows. There's no rush, no bells, just a warm hello.",
    color: "#60A5FA", // blue
    accent: "bg-blue-50",
  },
  {
    time: "8:30 AM",
    title: "Circle Time",
    subtitle: "Gathering together",
    copy: "The day begins in our quiet gathering space. We sit together, sing a familiar song, and talk about the day ahead. Every child's presence matters. Every voice is heard.",
    color: "#FBC247", // yellow
    accent: "bg-yellow-50",
  },
  {
    time: "9:30 AM",
    title: "Exploration & Play",
    subtitle: "Learning through discovery",
    copy: "Children move freely between carefully prepared learning stations. A botanist studies leaves. A builder constructs towers. An artist mixes colors. We follow their curiosity, not a curriculum clock.",
    color: "#22C55E", // green
    accent: "bg-green-50",
  },
  {
    time: "11:30 AM",
    title: "Outdoor Time",
    subtitle: "The garden & the breeze",
    copy: "Rain or shine, we're outside. Digging in soil, climbing, running, noticing the world. Bermuda's gentle climate is a gift. Nature isn't a field trip—it's part of our day.",
    color: "#FF6B2C", // orange
    accent: "bg-orange-50",
  },
  {
    time: "12:30 PM",
    title: "Lunch & Connection",
    subtitle: "Nourishment and togetherness",
    copy: "We sit together for family-style meals. Children serve themselves, try new things, and talk. Food is simple, seasonal, nourishing. Eating is a social act, not a task.",
    color: "#60A5FA", // blue
    accent: "bg-blue-50",
  },
  {
    time: "1:30 PM",
    title: "Rest & Restoration",
    subtitle: "Quiet time in our soft nest",
    copy: "Every child retreats to our dim, calm rest room. Some sleep deeply. Some read quietly. All are protected. We believe rest is as important as activity. Quiet time is sacred.",
    color: "#FBC247", // yellow
    accent: "bg-yellow-50",
  },
  {
    time: "3:30 PM",
    title: "Afternoon Rhythm",
    subtitle: "Slowing into reflection",
    copy: "We wake gently. Snack. Small group time. Stories, art, music. The pace is intentional, never rushed. We're building capacity, confidence, and a love of learning.",
    color: "#22C55E", // green
    accent: "bg-green-50",
  },
  {
    time: "5:00 PM",
    title: "Departure",
    subtitle: "Until tomorrow",
    copy: "As the day ends, we talk about what we discovered, what we built, what we learned. Parents arrive to hear stories and see the evidence of their child's day. We wave goodbye, knowing we'll do it all again tomorrow.",
    color: "#FF6B2C", // orange
    accent: "bg-orange-50",
  },
];

export default function DayRhythm() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <Section testId="day-rhythm" surface="white" size="lg">
      {/* Subtle premium background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-gradient-to-b from-brand-yellow/8 via-transparent to-transparent blur-3xl"
      />

      <Container>
        {/* Header */}
        <div className="relative mb-16 sm:mb-20 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-ink/70 sm:text-sm sm:tracking-[0.28em]">
            A day in our rhythm
          </p>
          <h2 className="mt-3 font-poppins text-3xl font-bold leading-[1.05] text-brand-ink sm:mt-4 sm:text-5xl md:text-6xl">
            What happens inside these hours.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-brand-ink/70 sm:mt-8 sm:text-lg sm:leading-8">
            A day at Tiny Explorers isn't rushed. It follows the natural rhythm of childhood—moments of intensity and calm, learning and rest, independence and belonging. Every hour is designed with intention. Every transition is gentle.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Vertical line decoration (desktop only) */}
          <div
            aria-hidden
            className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-brand-orange/20 via-brand-orange/10 to-transparent lg:block"
          />

          {/* Moments */}
          <div className="grid gap-10 sm:gap-12 lg:gap-16">
            {dayMoments.map((moment, index) => (
              <div
                key={index}
                className="group relative grid items-start gap-6 sm:gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12"
              >
                {/* Timeline dot and time (left column on desktop, top on mobile) */}
                <div className="relative lg:text-right">
                  {/* Dot */}
                  <div className="relative mb-4 flex items-center gap-4 lg:mb-0 lg:justify-end">
                    <div
                      aria-hidden
                      className="h-4 w-4 rounded-full shadow-sm lg:h-5 lg:w-5"
                      style={{ backgroundColor: moment.color }}
                    />
                    <div className="h-0.5 w-6 bg-gradient-to-r from-brand-ink/20 to-transparent lg:hidden" />
                  </div>

                  {/* Time */}
                  <div className="mt-2">
                    <p
                      className="text-sm font-bold uppercase tracking-[0.18em] lg:text-[13px]"
                      style={{ color: moment.color }}
                    >
                      {moment.time}
                    </p>
                  </div>
                </div>

                {/* Content card (right column on desktop, full width on mobile) */}
                <div
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`group/card rounded-[2rem] border transition-all duration-300 ease-soft p-6 sm:p-8 lg:p-10 ${
                    activeIndex === index
                      ? `border-black/20 shadow-soft-lg ${moment.accent}`
                      : "border-black/5 hover:border-black/10 hover:shadow-soft"
                  }`}
                >
                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-poppins text-xl font-semibold leading-tight text-brand-ink sm:text-2xl lg:text-3xl">
                      {moment.title}
                    </h3>
                    <p
                      className="mt-1.5 text-xs font-medium tracking-wide sm:mt-2 sm:text-sm"
                      style={{ color: moment.color }}
                    >
                      {moment.subtitle}
                    </p>
                  </div>

                  {/* Copy */}
                  <p className="mt-4 text-sm leading-6 text-brand-ink/75 sm:mt-5 sm:text-[16px] sm:leading-7 lg:text-[17px]">
                    {moment.copy}
                  </p>

                  {/* Accent bar (bottom of card) */}
                  <div
                    aria-hidden
                    className="mt-4 h-0.5 w-10 rounded-full transition-all duration-300 ease-soft sm:mt-5 sm:w-12 group-hover/card:sm:w-16"
                    style={{ backgroundColor: moment.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing message */}
        <div className="mt-16 sm:mt-20 rounded-[2rem] border border-black/5 bg-gradient-to-br from-brand-cream to-white/90 p-8 sm:p-12 md:p-16 text-center shadow-soft">
          <p className="mx-auto max-w-2xl text-base leading-7 text-brand-ink/80 sm:text-lg sm:leading-8">
            This rhythm is not rigid. It bends with the weather, the children's needs, the seasons. Some days are louder than others. Some are quieter. All are intentional. All are held with care.
          </p>
          <p className="mt-5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/70 sm:mt-7 sm:text-sm sm:tracking-[0.22em]">
            Every day matters
          </p>
        </div>
      </Container>
    </Section>
  );
}
