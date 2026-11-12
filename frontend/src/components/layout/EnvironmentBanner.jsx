import React from "react";

/** Thin label shown only on non-production builds that set REACT_APP_ENV_LABEL (e.g. staging). */
export default function EnvironmentBanner() {
  const label = process.env.REACT_APP_ENV_LABEL;
  if (!label) return null;
  return (
    <div
      role="note"
      data-testid="environment-banner"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-[80] mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full bg-brand-ink px-4 py-1.5 text-center text-xs font-semibold text-white shadow-soft"
    >
      {label}
    </div>
  );
}
