import React from "react";
import { Helmet } from "react-helmet-async";
import { useInRouterContext, useLocation } from "react-router-dom";
import { DEFAULT_META, getCanonicalUrl } from "../data/content";

/**
 * <PageMeta> — sets a unique <title>, meta description, canonical URL, and
 * Open Graph/Twitter tags per route. Drop it once near the top of each page.
 *
 * Falls back to the site-wide defaults (matching index.html) when a page
 * doesn't pass its own title/description.
 */
export default function PageMeta({ title, description }) {
  const inRouter = useInRouterContext();
  const pathname = inRouter ? useLocation().pathname : "/";
  const resolvedTitle = title || DEFAULT_META.title;
  const resolvedDescription = description || DEFAULT_META.description;
  const url = getCanonicalUrl(pathname);

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Helmet>
  );
}
