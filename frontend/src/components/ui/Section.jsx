import React from "react";
import { useInView } from "../../hooks/useInView";

/**
 * Shared layout primitives that establish a single editorial rhythm
 * across every section of the site.
 *
 * - <Section>   handles the outer <section>, vertical rhythm, optional surface
 *               color, scroll-triggered fade-up reveal, and the id/data-testid
 *               hooks used by the navbar + tests.
 * - <Container> is the inner max-width + horizontal padding wrapper.
 * - <Eyebrow>   is the small UPPERCASE label that introduces every section
 *               (small bar + accent text). It's the most-repeated mini-pattern
 *               on the site — centralizing it eliminates the visual drift.
 *
 * These are intentionally light: no opinionated grid, no internal heading.
 * Each section composes them with its own headline/body for editorial freedom.
 */

const SURFACES = {
  cream: "",                 // page default (cream comes from <body>)
  white: "bg-white",
  surface: "bg-brand-surface",
};

const SIZES = {
  // Vertical rhythm. md+ uses the larger value. Keep in lockstep across the site.
  default: "py-24 md:py-32",
  lg: "py-28 md:py-36",
  xl: "py-32 md:py-40",
  sm: "py-20 md:py-24",
};

export function Section({
  id,
  testId,
  surface = "cream",
  size = "default",
  className = "",
  children,
  as: As = "section",
  reveal = true,             // scroll-triggered fade-up on entry; opt-out for hero/etc.
  ...rest
}) {
  const [ref, inView] = useInView({ rootMargin: "0px 0px -8% 0px", threshold: 0.05, once: true });

  // Initial state slightly translated down + transparent; flips on inView.
  // Class is motion-safe — fully respected by prefers-reduced-motion.
  const revealCls = reveal
    ? `motion-safe:transition-all motion-safe:duration-[900ms] motion-safe:ease-soft ${
        inView
          ? "motion-safe:opacity-100 motion-safe:translate-y-0"
          : "motion-safe:opacity-0 motion-safe:translate-y-4"
      }`
    : "";

  return (
    <As
      ref={reveal ? ref : undefined}
      id={id}
      data-testid={testId}
      className={`relative ${SURFACES[surface] ?? ""} ${SIZES[size] ?? SIZES.default} ${revealCls} ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}

export function Container({
  size = "default",
  className = "",
  children,
  ...rest
}) {
  const widths = {
    default: "max-w-7xl",
    narrow: "max-w-6xl",
    prose: "max-w-3xl",
    wide: "max-w-[88rem]",
  };
  return (
    <div
      className={`relative mx-auto ${widths[size] ?? widths.default} px-6 md:px-10 lg:px-12 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * <Eyebrow> — the editorial micro-label that anchors every section.
 *   <Eyebrow>Our Environment</Eyebrow>
 *   <Eyebrow color="green">Programs</Eyebrow>
 */
const EYEBROW_COLORS = {
  orange: { text: "text-brand-orange", bar: "bg-brand-orange" },
  green: { text: "text-brand-green", bar: "bg-brand-green" },
  blue: { text: "text-brand-blue", bar: "bg-brand-blue" },
  ink: { text: "text-brand-ink/70", bar: "bg-brand-ink/40" },
};

export function Eyebrow({ color = "orange", className = "", children }) {
  const c = EYEBROW_COLORS[color] ?? EYEBROW_COLORS.orange;
  return (
    <div
      className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] ${c.text} ${className}`}
    >
      <span className={`h-px w-8 ${c.bar}`} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/**
 * <SectionHeader> — the most-repeated header pattern: eyebrow + headline + optional lede.
 * Used in Features, Programs, Environment, Gallery, Testimonials. Centralizing it
 * locks in identical type rhythm and spacing.
 */
export function SectionHeader({
  eyebrow,
  eyebrowColor = "orange",
  title,
  lede,
  align = "split",        // "split" (heading left, lede right) | "center" | "stack"
  className = "",
  children,                // optional right-rail content (e.g. a button)
}) {
  if (align === "center") {
    return (
      <div className={`mx-auto max-w-3xl text-center ${className}`}>
        {eyebrow && (
          <div className="flex justify-center">
            <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
          </div>
        )}
        {title && (
          <h2 className="mt-4 font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {title}
          </h2>
        )}
        {lede && (
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-[1.6] text-brand-ink/65 sm:text-[1.0625rem] sm:leading-[1.7]">
            {lede}
          </p>
        )}
      </div>
    );
  }

  if (align === "stack") {
    return (
      <div className={`max-w-3xl ${className}`}>
        {eyebrow && <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>}
        {title && (
          <h2 className="mt-4 font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {title}
          </h2>
        )}
        {lede && (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-[1.6] text-brand-ink/65 sm:text-[1.0625rem] sm:leading-[1.7]">
            {lede}
          </p>
        )}
        {children}
      </div>
    );
  }

  // "split" — heading left, lede (+ optional right rail) right
  return (
    <div className={`grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-20 sm:gap-10 ${className}`}>
      <div>
        {eyebrow && <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>}
        {title && (
          <h2 className="mt-3 font-poppins text-3xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:mt-4 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {title}
          </h2>
        )}
      </div>
      <div className="flex flex-col items-start gap-3 sm:gap-4 lg:items-end lg:gap-5 lg:text-right">
        {lede && (
          <p className="text-pretty text-base leading-[1.6] text-brand-ink/65 sm:text-[1.0625rem] sm:leading-[1.7] lg:max-w-md">
            {lede}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export default Section;
