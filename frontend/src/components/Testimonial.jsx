import React from "react";
import { Quote, Star } from "lucide-react";
import { Section, Container, Eyebrow } from "./ui/Section";
import { TESTIMONIAL } from "../data/content";

export default function Testimonial() {
  return (
    <Section id="testimonials" testId="testimonial-section" size="lg">
      <Container size="narrow">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* ─────────── Launch phase — testimonials temporarily hidden ─────────── */}
          {/* Original side label preserved for easy restoration: */}
          {/* <div className="lg:sticky lg:top-32"> */}
          {/*   <Eyebrow>Loved by families</Eyebrow> */}
          {/*   <h2>Words from our parents.</h2> */}
          {/*   <div className="mt-6">... star rating + review_count ...</div> */}
          {/* </div> */}

          {/* Launch-stage messaging */}
          <div className="lg:sticky lg:top-32">
            <Eyebrow>Opening Fall 2026</Eyebrow>
            <h2 className="mt-5 font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-4xl">
              Built with intention.
            </h2>
          </div>

          {/* Testimonial card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 ring-1 ring-black/5 ring-soft sm:p-14">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-yellow/35 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-brand-green/22 blur-3xl"
            />

            <Quote
              size={44}
              strokeWidth={2.5}
              className="relative text-brand-yellow"
              fill="#FBC247"
            />

            {/* Launch message — warm, intentional, builds confidence without fabrication */}
            <div className="relative mt-6">
              <div className="text-5xl leading-none text-brand-ink/15">"</div>
              <p className="mt-4 font-poppins text-[1.3rem] font-medium leading-[1.5] tracking-tight text-brand-ink sm:text-[1.5rem] md:text-[1.65rem]">
                {TESTIMONIAL.launch_message}
              </p>
            </div>

            {/* Editorial attribution — anchors the message authentically */}
            <div className="relative mt-10 text-sm text-brand-ink/70">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink/70">Tiny Explorers</span>
              <div className="mt-2 text-brand-ink/70">Designed for curious children and discerning families.</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
