import React from "react";

/**
 * Hand-drawn vector "splat" image frames — the moodboard's signature treatment.
 *
 * Each splat is an irregular, organic outline rendered as an SVG <clipPath>.
 * Wrap any image with <SplatFrame variant="splat-1"> to get the cutout effect.
 *
 * Unlike the symmetric CSS border-radius "blobs", these have hand-drawn lumps,
 * bumps and gentle points — closer to a torn paper / cloud / spiky-star shape.
 *
 * Each path is normalized to a 1000x1000 viewBox so they can scale fluidly.
 */

const SPLATS = {
  // Spiky-cloud — used for hero main image; lots of small lumps
  "splat-1":
    "M500 35 C 605 50 660 0 740 60 C 820 120 830 200 900 245 C 970 290 985 380 950 460 C 915 540 985 605 950 685 C 915 765 825 770 760 830 C 695 890 605 925 510 905 C 415 885 340 945 265 905 C 190 865 165 780 105 740 C 45 700 35 615 55 535 C 75 455 15 390 55 315 C 95 240 175 230 235 175 C 295 120 305 50 395 35 C 445 27 460 30 500 35 Z",

  // Soft-flower / cloud — used for hero accent image
  "splat-2":
    "M500 50 C 600 30 685 75 750 130 C 815 185 905 195 935 275 C 965 355 905 425 935 510 C 965 595 920 680 845 710 C 770 740 745 825 660 845 C 575 865 510 815 425 845 C 340 875 245 850 195 770 C 145 690 70 670 60 575 C 50 480 105 410 70 320 C 35 230 130 175 195 140 C 260 105 305 60 395 60 C 440 60 460 58 500 50 Z",

  // Rounded torn-paper — used for environment image, more horizontal
  "splat-3":
    "M120 350 C 80 240 165 145 270 130 C 360 117 405 60 510 50 C 615 40 690 110 770 130 C 870 155 945 230 935 340 C 925 450 970 540 905 630 C 840 720 745 705 645 740 C 545 775 460 830 365 800 C 270 770 195 800 130 730 C 65 660 95 565 75 470 C 60 405 100 410 120 350 Z",
};

/**
 * <SplatFrame> — drop an <img> inside.
 *
 * Uses an SVG <clipPath> with `clipPathUnits="objectBoundingBox"` so the same
 * shape works at any aspect ratio. The clip is applied via CSS `clip-path: url(#id)`.
 *
 * Each instance gets a unique id so multiple splats on a page don't collide.
 */
let SPLAT_UID = 0;
const useSplatId = () => {
  const [id] = React.useState(() => `splat-${++SPLAT_UID}`);
  return id;
};

export function SplatFrame({
  variant = "splat-1",
  className = "",
  children,
  /** Optional cream/orange/etc. backing layer that peeks out behind the cutout. */
  backingClass = "",
  /** Offset (in tailwind class form) for the backing layer. */
  backingOffset = "translate-x-3 translate-y-3",
}) {
  const id = useSplatId();
  const d = SPLATS[variant] ?? SPLATS["splat-1"];

  return (
    <div className={`relative ${className}`}>
      {/* Inline SVG only carries the clipPath def; nothing visual rendered. */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            {/* Scale viewBox 0-1000 down to 0-1 */}
            <path
              d={d}
              transform="scale(0.001 0.001)"
            />
          </clipPath>
        </defs>
      </svg>

      {/* Backing splat — a flat color layer offset behind the image */}
      {backingClass && (
        <div
          aria-hidden
          className={`absolute inset-0 ${backingOffset} ${backingClass}`}
          style={{ clipPath: `url(#${id})`, WebkitClipPath: `url(#${id})` }}
        />
      )}

      {/* Foreground clipped content */}
      <div
        className="relative h-full w-full"
        style={{ clipPath: `url(#${id})`, WebkitClipPath: `url(#${id})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function EditorialFrame({
  className = "",
  children,
  backingClass = "",
  backingOffset = "translate-x-4 translate-y-4",
}) {
  return (
    <div className={`relative ${className}`}>
      {backingClass && (
        <div
          aria-hidden
          className={`absolute inset-0 ${backingOffset} ${backingClass}`}
        />
      )}
      <div className="relative overflow-hidden rounded-[2.25rem] bg-white/95 ring-soft">
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Curated doodle library — six hand-drawn accents.
 *  Designed to be used sparingly: at most 1–2 per section.
 *  Each accepts className + color, and is aria-hidden.
 * ────────────────────────────────────────────────────────────
 */

const baseDoodleProps = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

/** Soft upward-curving smile arc. */
export const DoodleSmile = ({ className = "", color = "#22C55E" }) => (
  <svg viewBox="0 0 80 36" className={className} {...baseDoodleProps}>
    <path d="M6 12 C 22 32, 58 32, 74 12" stroke={color} strokeWidth="3.5" />
    <circle cx="22" cy="8" r="2.2" fill={color} />
    <circle cx="58" cy="8" r="2.2" fill={color} />
  </svg>
);

/** Light scribbly curl — like a tendril. */
export const DoodleCurl = ({ className = "", color = "#FF6B2C" }) => (
  <svg viewBox="0 0 110 40" className={className} {...baseDoodleProps}>
    <path
      d="M6 26 C 18 8, 36 8, 42 22 C 46 32, 60 32, 66 20 C 72 8, 90 8, 102 22"
      stroke={color}
      strokeWidth="3.2"
    />
  </svg>
);

/** Subtle wavy line — for underlines under headline words. */
export const DoodleUnderline = ({ className = "", color = "#FF6B2C" }) => (
  <svg viewBox="0 0 200 14" className={className} preserveAspectRatio="none" {...baseDoodleProps}>
    <path
      d="M3 9 C 40 1, 80 13, 120 6 S 197 4, 197 4"
      stroke={color}
      strokeWidth="3.5"
    />
  </svg>
);

/** Tiny burst star — used as a sparse accent. */
export const DoodleBurst = ({ className = "", color = "#FBC247" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
    <path
      d="M12 2 L13.4 9 L20.5 10.5 L13.6 12 L12 19 L10.4 12 L3.5 10.5 L10.6 9 Z"
      fill={color}
    />
  </svg>
);

/** Loose vertical zigzag — used for vertical rhythm between sections. */
export const DoodleZigzag = ({ className = "", color = "#60A5FA" }) => (
  <svg viewBox="0 0 30 100" className={className} {...baseDoodleProps}>
    <path
      d="M6 6 L 22 22 L 6 38 L 22 54 L 6 70 L 22 86"
      stroke={color}
      strokeWidth="3"
    />
  </svg>
);

/** A small open-ended scribble dot cluster. */
export const DoodleDots = ({ className = "", color = "#22C55E" }) => (
  <svg viewBox="0 0 40 16" className={className} aria-hidden focusable="false">
    <circle cx="6" cy="8" r="2.4" fill={color} />
    <circle cx="20" cy="8" r="2.4" fill={color} />
    <circle cx="34" cy="8" r="2.4" fill={color} />
  </svg>
);

export default SplatFrame;
