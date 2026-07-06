import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import Logo from "./Logo";
import Button from "./ui/Button";
import { toast } from "sonner";
import api from "../lib/api";
import FieldError from "./ui/FieldError";
import { BRAND, FOOTER } from "../data/content";

/**
 * Footer — premium expansion.
 *
 * What changed vs. the previous footer:
 *  - Footer-only tagline (FOOTER.tagline) under the logo, separate from the
 *    navbar/hero BRAND.slogan — gives the footer its own voice.
 *  - Four navigation columns (Programs / About / Parents / Connect) instead
 *    of three, structured from data/content.js → FOOTER.columns.
 *  - All column links use React Router <Link>, with hash anchors handled.
 *  - Bermuda reference line ("Designed for island children, raised under
 *    the Bermuda sun.") above the legal bar.
 *  - Newsletter form preserved with its existing /newsletter API integration.
 *  - Enrollment-inquiry button preserved.
 *  - Legal row uses data-driven items (FOOTER.legal).
 *
 *  No social media row: FOOTER.socials was never defined, so add real
 *  account URLs to content.js and reinstate this block if/when the school
 *  has live social accounts to link to.
 */

function FooterLink({ to, children }) {
  // hash-only ("/#programs") => react-router Link handles it
  return (
    <Link to={to} className="text-[15px] text-brand-ink/70 transition hover:text-brand-ink">
      {children}
    </Link>
  );
}

export default function Footer({ onEnroll }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email.");
      toast.error("Please enter a valid email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/newsletter", { email });
      toast.success(data.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not subscribe. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Could not subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      data-testid="site-footer"
      className="relative bg-[#F1F1F1] pt-20 pb-10"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Top grid: Brand (wider) + 3 nav columns + newsletter */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.5fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="Tiny Explorers — home"
              className="inline-block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
            >
              <Logo />
            </Link>
            <p
              data-testid="footer-tagline"
              className="mt-5 font-poppins text-[16px] italic font-medium leading-snug text-brand-orange"
            >
              {FOOTER.tagline}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/70">
              {BRAND.description}
            </p>
            <div className="mt-6 space-y-3 text-sm text-brand-ink/75">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} strokeWidth={2.5} className="mt-0.5 flex-none text-brand-orange" />
                <span>{BRAND.address}</span>
              </div>
              <a href={BRAND.phoneHref} className="flex items-center gap-2.5 transition hover:text-brand-ink">
                <Phone size={16} strokeWidth={2.5} className="text-brand-orange" />
                {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2.5 transition hover:text-brand-ink">
                <Mail size={16} strokeWidth={2.5} className="text-brand-orange" />
                {BRAND.email}
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER.columns?.map((col) => (
            <div key={col.title}>
              <div className="font-poppins text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
                {col.title}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <FooterLink to={l.to}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter + admissions inquiry */}
          <div>
            <div className="font-poppins text-[12px] font-bold uppercase tracking-[0.2em] text-brand-ink">
              Stay in the loop
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/70">
              {FOOTER.newsletter_lede ||
                "Open house dates, parenting essays, and the occasional poem from a three-year-old."}
            </p>
            <form
              onSubmit={onSubscribe}
              data-testid="newsletter-form"
              noValidate
              className="mt-5 flex items-center gap-2 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-black/5"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="your@email.com"
                data-testid="newsletter-input"
                className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-brand-ink placeholder:text-brand-ink/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                aria-label="Email for newsletter"
                aria-invalid={!!error}
                aria-describedby={error ? "newsletter-email-error" : undefined}
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="newsletter-submit"
                className="inline-flex items-center justify-center rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-all duration-300 ease-soft hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Subscribe"}
              </button>
            </form>
            <FieldError id="newsletter-email-error" message={error} />

            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={onEnroll}
                testId="footer-inquiry-button"
              >
                Start enrollment inquiry
              </Button>
            </div>
          </div>
        </div>

        {/* Bermuda reference line */}
        {FOOTER.bermuda_note && (
          <div
            data-testid="footer-bermuda-note"
            className="mt-16 border-t border-brand-ink/10 pt-8 text-center font-poppins text-[13px] italic text-brand-ink/70"
          >
            {FOOTER.bermuda_note}
          </div>
        )}

        {/* Legal bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-brand-ink/70 sm:flex-row">
          <div>
            © {new Date().getFullYear()} Tiny Explorers Bermuda Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            {(FOOTER.legal || []).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="transition hover:text-brand-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
