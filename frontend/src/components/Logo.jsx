import React from "react";

export const Logo = ({ className = "", showTagline = false }) => (
  <span
    data-testid="brand-logo"
    className={`inline-flex items-center gap-2.5 group ${className}`}
  >
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white shadow-soft">
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M6 14c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="9" cy="11" r="1.2" fill="currentColor" />
        <circle cx="15" cy="11" r="1.2" fill="currentColor" />
      </svg>
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-yellow ring-2 ring-brand-cream" />
    </span>
    <span className="flex flex-col leading-tight">
      <span className="font-poppins text-lg font-bold tracking-tight text-brand-ink">
        Tiny Explorers Nursery & Preschool
      </span>
      {showTagline && (
        <span
          data-testid="brand-tagline"
          className="font-poppins text-[10px] italic font-medium leading-tight text-brand-orange"
        >
          Where Learning Blossoms, and Adventures Begin
        </span>
      )}
    </span>
  </span>
);

export default Logo;
