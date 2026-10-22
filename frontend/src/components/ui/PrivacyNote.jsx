import React from "react";
import { getPublicAssetUrl, PRIVACY_NOTICE } from "../../data/content";

/**
 * Short notice shown where a form collects personal information, linking to
 * the full privacy policy. Opens in a new tab so a half-filled form is kept.
 */
export default function PrivacyNote({ kind = "enquiry", className = "" }) {
  return (
    <p className={`text-xs leading-relaxed text-brand-ink/70 ${className}`} data-testid={`privacy-note-${kind}`}>
      {PRIVACY_NOTICE[kind]}{" "}
      <a
        href={getPublicAssetUrl(PRIVACY_NOTICE.policyPath)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-brand-ink underline underline-offset-2"
      >
        Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
      </a>
      .
    </p>
  );
}
