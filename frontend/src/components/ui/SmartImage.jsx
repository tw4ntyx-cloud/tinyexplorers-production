import React, { useState } from "react";

/**
 * <SmartImage> — production image primitive.
 *
 * Solves three problems the previous raw <img> tags had:
 *
 * 1. Cumulative Layout Shift (CLS) — `width` and `height` attributes are
 *    required so the browser can reserve box space before the image loads.
 *    We pull those from the content data layer (`IMAGES.*.width/height`).
 *
 * 2. Loading priority — hero images need `loading="eager"` and a higher
 *    fetch priority; everything else should lazy-load + async-decode.
 *
 * 3. LCP polish — a tiny opacity transition on load smooths the appearance
 *    without the cheap "fade-from-grey-box" trope.
 *
 * Usage:
 *   <SmartImage source={IMAGES.heroMain} priority className="..." />
 *
 * `source` is one of the records from data/content.js (has src/alt/w/h).
 * Pass `alt=""` only if explicitly decorative; otherwise the source.alt wins.
 */
export default function SmartImage({
  source,
  alt,                              // override (e.g. for accessibility context)
  priority = false,                 // true => eager + high fetchpriority
  sizes,                            // optional responsive sizes
  className = "",
  imgClassName = "",
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  if (!source?.src) return null;

  const resolvedAlt = alt ?? source.alt ?? "";

  return (
    <img
      src={source.src}
      alt={resolvedAlt}
      width={source.width}
      height={source.height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // fetchpriority is a native attribute (rendered as lowercase fetchpriority by React 19)
      fetchpriority={priority ? "high" : "auto"}
      onLoad={() => setLoaded(true)}
      className={`${className} ${imgClassName} transition-opacity duration-700 ease-soft ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      {...rest}
    />
  );
}
