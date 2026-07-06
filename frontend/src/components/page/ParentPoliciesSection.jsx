import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, Container, Eyebrow } from "../ui/Section";
import Button from "../ui/Button";
import { PARENT_POLICIES } from "../../data/content";

export default function ParentPoliciesSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Section
      id="parent-policies"
      testId="parent-policies-section"
      size="sm"
      surface="white"
      className="border-y border-brand-ink/10"
    >
      <Container size="narrow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow color="orange">Parent Information & Policies</Eyebrow>
            <h2 className="mt-5 font-poppins text-3xl font-bold leading-[1.08] tracking-tight text-brand-ink sm:text-4xl">
              Calm guidance for the policies that support daily family life.
            </h2>
            <p className="mt-5 text-[1.02rem] leading-[1.7] text-brand-ink/70">
              These documents outline how we care for children, communicate with families, and protect the routines that make Tiny Explorers feel steady and thoughtful.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-controls="parent-policies-panel"
            data-testid="parent-policies-toggle"
            className="inline-flex items-center justify-between gap-3 rounded-full border border-brand-ink/15 bg-white px-5 py-3 text-sm font-semibold text-brand-ink shadow-soft transition-colors duration-300 ease-soft hover:border-brand-ink/30 hover:bg-brand-cream"
          >
            <span>{isOpen ? "Hide policies" : "View all policies"}</span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
        </div>

        {isOpen && (
          <div
            id="parent-policies-panel"
            className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
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
        )}
      </Container>
    </Section>
  );
}
