import React, { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Section, Container, SectionHeader } from "./ui/Section";
import SmartImage from "./ui/SmartImage";
import { IMAGES, PROGRAMS } from "../data/content";

/**
 * Programs — simplified, content-driven, with SmartImage.
 *
 * Removed from the very first version:
 *  - "3 spots left" / "Waitlist open" / "Open enrollment" urgency pills
 *  - Per-card "Inquire about this program" footer (consolidated to one)
 *  - Heavy dark gradient scrim on every image
 *
 * Kept (moodboard pattern):
 *  - 4:5 image at top with age pill
 *  - Name + 1-line description below
 *  - Section-level "Inquire" CTA next to the header
 *
 * Image URLs and copy live in src/data/content.js — this component is now
 * pure presentation, easy to swap when the client supplies photography.
 */

export default function Programs({ onEnroll }) {
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [infoOpen, setInfoOpen] = useState(false);

  const openProgramInfo = (program) => {
    setSelectedProgram(program);
    setInfoOpen(true);
  };

  const closeProgramInfo = () => setInfoOpen(false);

  const handleProgramInquiry = () => {
    closeProgramInfo();
    onEnroll(selectedProgram.programOption);
  };

  return (
    <Section id="programs" testId="programs-section" surface="white" size="lg">
      {/* Subtle warm decoration — kept minimal */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-brand-orange/10 blur-[100px]"
      />

      <Container>
        <SectionHeader
          eyebrow="Programs"
          title="A program for every stage of small."
          lede="Four thoughtfully designed programs — from first steps to the early school years. Every classroom is led by certified educators with Bermuda Ministry of Education registration."
        >
          <button
            onClick={onEnroll}
            data-testid="programs-cta"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-soft hover:scale-[1.02] hover:bg-brand-orange"
          >
            Inquire about a program
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </SectionHeader>

        <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <article key={p.name} data-testid={p.testId} className="group flex flex-col">
              {/* Image — 4:5, rounded, warm-graded. No dark scrim. */}
              <div className="image-warm relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-cream">
                <SmartImage
                  source={IMAGES[p.image]}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-soft group-hover:scale-[1.04]"
                />
                {/* Single age pill — the only overlay on the image */}
                <span
                  className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] backdrop-blur"
                  style={{ color: p.accent }}
                >
                  {p.age}
                </span>
              </div>

              <h3 className="mt-5 font-poppins text-[1.25rem] font-semibold leading-tight text-brand-ink">
                {p.name}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-brand-ink/65">
                {p.desc}
              </p>

              {/* Per-card "Learn more" link — text-only, no border, much quieter */}
              <button
                onClick={() => openProgramInfo(p)}
                data-testid={`${p.testId}-cta`}
                className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-ink/80 transition group-hover:text-brand-orange"
              >
                Learn more
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </article>
          ))}
        </div>
      </Container>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent
          data-testid="program-info-modal"
          className="mx-4 max-w-4xl rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
        >
          <div className="space-y-6 p-6 sm:space-y-8 sm:p-8 md:p-12">
            <DialogHeader>
              <DialogTitle className="font-poppins text-3xl font-semibold tracking-tight text-brand-ink">
                {selectedProgram.name}
              </DialogTitle>
              <DialogDescription className="mt-3 text-base leading-7 text-brand-ink/70">
                {selectedProgram.age} · {selectedProgram.desc}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft-sm">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Educational philosophy
                  </h4>
                  <p className="mt-4 text-sm leading-7 text-brand-ink/80">
                    {selectedProgram.philosophy}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Daily rhythm
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-ink/80">
                      {selectedProgram.daily_rhythm.map((item) => (
                        <li key={item} className="before:mr-2 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-brand-orange before:align-middle">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Classroom atmosphere
                    </p>
                    <p className="mt-4 text-sm leading-7 text-brand-ink/80">
                      {selectedProgram.atmosphere}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Example activities
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-ink/80">
                    {selectedProgram.activities.map((activity) => (
                      <li key={activity} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-orange" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Ready to learn more?
                    </p>
                    <p className="mt-2 text-sm leading-6 text-brand-ink/80">
                      Inquire directly about this program and let our team connect you with the right next step.
                    </p>
                  </div>
                  <button
                    onClick={handleProgramInquiry}
                    data-testid="program-info-inquire"
                    className="inline-flex items-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02]"
                  >
                    Inquire About This Program
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
