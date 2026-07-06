import React from "react";
import { Container } from "../ui/Section";
import { Eyebrow } from "../ui/Section";
import SmartImage from "../ui/SmartImage";
import { EditorialFrame, SplatFrame } from "../decor/Splat";

/**
 * <PageHero> — the small editorial hero each subpage opens with.
 *
 * Composition: eyebrow + display headline + lede on the left, framed
 * splat image on the right. Quieter than the homepage Hero — no floating
 * trust cards, no marquee, no doodles. The job of a subpage hero is to
 * set tone and topic, not to convert.
 *
 * Props:
 *   eyebrow            small section label (string)
 *   eyebrowColor       eyebrow color key (see <Eyebrow>) — defaults to orange
 *   title              h1 (string) — supports inline emphasis via `titleEmphasis`
 *   titleLead          alt: explicit pieces for inline emphasis
 *   titleEmphasis      colored emphasis word/phrase (renders in the accent)
 *   titleTail          alt: tail after emphasis
 *   lede               supporting paragraph
 *   image              IMAGES.* record (passed to <SmartImage>)
 *   splat              variant key (see <SplatFrame>) — default "splat-2"
 *   backingClass       backing layer color — default green/30
 *   emphasisColor      hex used for the inline emphasis word
 *   accentColor        eyebrow color key (alias for eyebrowColor)
 *
 * Layout: image on the right at md+, stacks above the copy on mobile.
 */

export default function PageHero({
  eyebrow,
  eyebrowColor,
  accentColor,
  title,
  titleLead,
  titleEmphasis,
  titleTail,
  emphasisColor = "#FF6B2C",
  lede,
  image,
  splat = "splat-2",
  backingClass = "bg-brand-green/25",
  children,           // optional extra (e.g. a CTA group)
  testId,
}) {
  const eyebrowResolved = accentColor || eyebrowColor || "orange";

  const trimmedTitleLead = titleLead?.trimEnd();
  const trimmedTitleEmphasis = titleEmphasis?.trim();
  const trimmedTitleTail = titleTail?.trim();
  const useEditorialFrame = splat === "rect";
  const Frame = useEditorialFrame ? EditorialFrame : SplatFrame;

  return (
    <section
      data-testid={testId || "page-hero"}
      className="relative pt-24 pb-12 sm:pt-32 md:pt-40 md:pb-24"
    >
      {/* Single, very low intensity warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(50%_40%_at_50%_0%,rgba(251,194,71,0.18)_0%,transparent_72%)]"
      />

      <Container>
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Copy */}
          <div className="relative">
            {eyebrow && <Eyebrow color={eyebrowResolved}>{eyebrow}</Eyebrow>}

            <h1
              className="mt-4 max-w-[min(60ch,100%)] font-poppins font-bold leading-[1.03] tracking-tight text-brand-ink sm:mt-5"
              style={{ fontSize: "clamp(1.95rem, 5vw, 4.5rem)" }}
            >
              {title ? (
                title
              ) : (
                <>
                  {trimmedTitleLead}
                  {trimmedTitleEmphasis && (
                    <>
                      {" "}
                      <span
                        className="relative inline-block"
                        style={{ color: emphasisColor }}
                      >
                        {trimmedTitleEmphasis}
                      </span>
                    </>
                  )}
                  {trimmedTitleTail}
                </>
              )}
            </h1>

            {lede && (
              <p className="mt-5 max-w-xl text-pretty text-base leading-[1.6] text-brand-ink/70 sm:mt-6 sm:text-[1.05rem] sm:leading-[1.7] md:text-[1.15rem]">
                {lede}
              </p>
            )}

            {children && <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9">{children}</div>}
          </div>

          {/* Image */}
          {image && (
            <div className="relative mx-auto h-[360px] w-full max-w-[540px] sm:h-[460px] lg:h-[520px]">
              <SplatFrame
                variant={splat}
                backingClass={backingClass}
                backingOffset="translate-x-4 translate-y-4"
                className="absolute inset-0"
              >
                <div className="image-warm h-full w-full">
                  <SmartImage
                    source={image}
                    priority
                    sizes="(min-width: 1024px) 42vw, 88vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </SplatFrame>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
