import React from "react";
import { Section, Container, Eyebrow } from "../components/ui/Section";
import PageMeta from "../components/PageMeta";
import Button from "../components/ui/Button";
import { BRAND } from "../data/content";

/**
 * Accessibility statement — a good-faith statement of our commitment and
 * current status, not a legal contract. Keep this honest and specific:
 * update the "current status" section whenever a real audit is completed.
 */
export default function Accessibility() {
  return (
    <Section size="xl" surface="cream" reveal={false}>
      <PageMeta
        title="Accessibility | Tiny Explorers Nursery & Preschool"
        description="Read the Tiny Explorers accessibility statement and learn how to report any website accessibility issue to our team."
      />
      <Container size="prose">
        <Eyebrow color="orange">Accessibility</Eyebrow>
        <h1 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
          Our commitment to accessibility.
        </h1>
        <p className="mt-6 text-[1.04rem] leading-[1.8] text-brand-ink/75">
          Tiny Explorers is committed to making our website usable by every
          family, regardless of ability. We aim to meet the Web Content
          Accessibility Guidelines (WCAG) 2.1 at the AA level, and we treat
          accessibility as an ongoing responsibility rather than a one-time
          project.
        </p>

        <h2 className="mt-10 font-poppins text-2xl font-semibold leading-tight text-brand-ink">
          What we're doing
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-[1.02rem] leading-[1.8] text-brand-ink/75">
          <li>Keyboard-navigable menus, forms, and dialogs with visible focus states.</li>
          <li>Descriptive alt text for meaningful images, and empty alt text for decorative ones.</li>
          <li>Text and background color combinations checked against WCAG AA contrast requirements.</li>
          <li>Semantic headings and landmarks so screen readers can navigate the page structure.</li>
        </ul>

        <h2 className="mt-10 font-poppins text-2xl font-semibold leading-tight text-brand-ink">
          Let us know if something doesn't work
        </h2>
        <p className="mt-4 text-[1.02rem] leading-[1.8] text-brand-ink/75">
          If you encounter a barrier using this site, please tell us — we
          want to fix it. Contact us and include the page and a short
          description of the issue.
        </p>
        <div className="mt-6">
          <Button variant="accent" href={`mailto:${BRAND.email}?subject=Accessibility%20feedback`} icon={false}>
            Email us about accessibility
          </Button>
        </div>
      </Container>
    </Section>
  );
}
