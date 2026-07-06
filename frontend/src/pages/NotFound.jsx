import React from "react";
import { Helmet } from "react-helmet-async";
import { Section, Container, Eyebrow } from "../components/ui/Section";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <Section size="xl" surface="cream" reveal={false}>
      <Helmet>
        <title>Page not found — Tiny Explorers Bermuda</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Container size="prose" className="text-center">
        <Eyebrow color="orange" className="justify-center">
          404
        </Eyebrow>
        <h1 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
          We couldn't find that page.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-[1.6] text-brand-ink/70 sm:text-[1.0625rem] sm:leading-[1.7]">
          The page you're looking for may have moved or no longer exists.
          Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="accent" to="/">
            Back to home
          </Button>
          <Button variant="secondary" to="/parents" icon={false}>
            Parent information
          </Button>
        </div>
      </Container>
    </Section>
  );
}
