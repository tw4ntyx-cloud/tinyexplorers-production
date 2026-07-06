import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_URL, DEFAULT_META } from "../data/content";

/**
 * <PageMeta> — sets a unique <title>, meta description, canonical URL, and
 * Open Graph/Twitter tags per route. Drop it once near the top of each page.
 *
 * Falls back to the site-wide defaults (matching index.html) when a page
 * doesn't pass its own title/description.
 */
export default function PageMeta({ title, description }) {
  const { pathname } = useLocation();
  const resolvedTitle = title || DEFAULT_META.title;
  const resolvedDescription = description || DEFAULT_META.description;
  const url = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Helmet>
  );
}
