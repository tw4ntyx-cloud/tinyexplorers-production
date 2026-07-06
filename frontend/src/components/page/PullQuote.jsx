import React from "react";
import { Section, Container } from "../ui/Section";

/**
 * <PullQuote> — editorial pull-quote.
 *
 * Used between long-form sections on Philosophy / Wellness pages to give
 * the reader a moment of breath. Large display type, narrow column, a
 * small orange leading mark, attribution beneath.
 *
 * The mark uses an SVG quote glyph so it doesn't compete with the chunky
 * lucide-react <Quote> icon already used in the homepage Testimonial
 * (visual differentiation between the two surfaces).
 */
export default function PullQuote({
  quote,
  author,
  context,
  align = "center",
  emphasis,           // optional substring of `quote` to highlight in orange
  size = "lg",        // "md" | "lg"
  testId = "pull-quote",
}) {
  const sizeCls =
    size === "md"
      ? "text-[1.55rem] sm:text-[1.85rem] md:text-[2.05rem]"
      : "text-[1.7rem] sm:text-[2.1rem] md:text-[2.5rem] lg:text-[2.7rem]";

  // Insert <span> around emphasis if requested.
  const rendered = emphasis && quote.includes(emphasis)
    ? quote.split(emphasis).map((chunk, i, arr) =>
        i < arr.length - 1 ? (
          <React.Fragment key={i}>
            {chunk}
            <span className="text-brand-orange">{emphasis}</span>
          </React.Fragment>
        ) : (
          <React.Fragment key={i}>{chunk}</React.Fragment>
        )
      )
    : quote;

  return (
    <Section testId={testId} size="default">
      <Container size="narrow">
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {/* Leading quote mark */}
          <svg
            viewBox="0 0 36 28"
            className={`mb-6 h-7 w-9 text-brand-orange ${align === "center" ? "mx-auto" : ""}`}
            aria-hidden
            fill="currentColor"
          >
            <path d="M14 0 C 6 0, 0 7, 0 16 L 0 28 L 14 28 L 14 16 L 6 16 C 6 12, 9 9, 14 8 Z M 36 0 C 28 0, 22 7, 22 16 L 22 28 L 36 28 L 36 16 L 28 16 C 28 12, 31 9, 36 8 Z" />
          </svg>

          <blockquote
            className={`font-poppins font-medium leading-[1.18] tracking-tight text-brand-ink ${sizeCls}`}
          >
            {rendered}
          </blockquote>

          {(author || context) && (
            <figcaption
              className={`mt-7 flex items-center gap-3 text-sm ${
                align === "center" ? "justify-center" : ""
              }`}
            >
              {author && (
                <span className="font-poppins font-semibold text-brand-ink">
                  — {author}
                </span>
              )}
              {context && <span className="text-brand-ink/70">· {context}</span>}
            </figcaption>
          )}
        </div>
      </Container>
    </Section>
  );
}
