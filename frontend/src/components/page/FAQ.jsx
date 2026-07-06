import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { Section, Container, SectionHeader } from "../ui/Section";

/**
 * <FAQ> — accessible accordion built on the existing shadcn/ui accordion
 * (Radix primitive). Used on Parents + Admissions pages.
 *
 * Each item should be `{ q: string, a: string | ReactNode, id?: string }`.
 * The Radix root uses `type="single"` so only one item is open at a time —
 * matches the calmer brand tone (no "everything expanded forever" feel).
 *
 * Heading and lede use the shared SectionHeader for type rhythm parity
 * with the rest of the site.
 */
export default function FAQ({
  eyebrow = "Frequently asked",
  title = "Answers, in calm detail.",
  lede,
  items = [],
  surface = "cream",
  testId = "faq-section",
  id,
}) {
  return (
    <Section id={id} testId={testId} surface={surface} size="lg">
      <Container size="narrow">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          align="center"
        />

        <Accordion
          type="single"
          collapsible
          className="mx-auto mt-14 max-w-3xl divide-y divide-brand-ink/10 border-y border-brand-ink/10"
        >
          {items.map((item, i) => (
            <AccordionItem
              key={item.id || `faq-${i}`}
              value={item.id || `faq-${i}`}
              className="!border-0"
              data-testid={`faq-item-${i}`}
            >
              <AccordionTrigger
                className="!flex w-full items-center justify-between gap-6 py-6 text-left font-poppins text-[1.05rem] font-semibold tracking-tight text-brand-ink !no-underline transition hover:!no-underline data-[state=open]:text-brand-orange"
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 pr-10 text-[15.5px] leading-[1.75] text-brand-ink/70">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}
