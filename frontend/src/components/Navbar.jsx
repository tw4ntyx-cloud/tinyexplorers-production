import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import Button from "./ui/Button";
import { BRAND, NAV } from "../data/content";

/**
 * Premium navbar — router-aware, dropdown-capable, scroll-locked mobile.
 *
 * Reads structure from data/content.js → NAV.
 * Each NAV item is either:
 *   { label, to }                     — flat link
 *   { label, items: [{label, to, desc?}] }  — dropdown
 *
 * Behaviour:
 *  - Active state on the parent label when any of its children, or its own
 *    `to`, matches the current route, OR while its dropdown is open.
 *    Hash-only anchors that resolve to "/" (e.g. "/#programs") never count
 *    as a route match on their own — there's no scroll-spy, so simply being
 *    on the homepage shouldn't light up every anchor link in the nav.
 *  - Dropdown opens on hover (desktop) with a small grace period so cursor
 *    travel doesn't dismiss it, and on click for keyboard/touch users.
 *    Clicking a trigger always opens (never toggles closed) so it can't
 *    be dismissed by accident while the mouse is still resting on it.
 *  - Mobile menu locks body scroll while open and renders nested groups
 *    as expandable sections.
 *  - Closes itself on route change, Escape, or a click outside.
 *
 * The on-scroll cream-glass background and the shrink-on-scroll affordance
 * are preserved from the previous navbar.
 */

function isActiveTo(currentPath, to) {
  if (!to) return false;
  const [base, hash] = to.split("#");
  const target = base || "/";
  // Hash-only anchors that land on the homepage aren't a distinct "page" —
  // there's no scroll-spy, so being on "/" shouldn't activate every
  // section anchor in the nav (Programs, Environment, Gallery, ...).
  if (hash && target === "/") return false;
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(target + "/");
}

function NavLinkBase({ to, children, isActive, onClick, className = "" }) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-soft hover:bg-brand-ink/5 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream";
  const state = isActive
    ? "text-brand-ink bg-brand-ink/10 shadow-[inset_0_0_0_1px_rgba(31,31,31,0.06)]"
    : "text-brand-ink/80";
  return (
    <Link to={resolveLinkTo(to)} onClick={onClick} className={`${base} ${state} ${className}`}>
      {children}
    </Link>
  );
}

function resolveLinkTo(to) {
  if (typeof to !== "string") return to;
  const [pathname, hash] = to.split("#");
  if (!hash) return to;
  return {
    pathname: pathname || "/",
    hash: `#${hash}`,
  };
}

const DROPDOWN_CLOSE_DELAY = 120;
const DROPDOWN_EXIT_DURATION = 160;

function Dropdown({ label, items, currentPath, onItemClick }) {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const containerRef = useRef(null);
  const closeTimer = useRef(null);
  const unmountTimer = useRef(null);

  const anyChildActive = items.some((i) => isActiveTo(currentPath, i.to));
  const highlighted = anyChildActive || open;

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  // Mount before the open animation, unmount only after the close
  // animation finishes — this is what gives the dropdown a real closing
  // transition instead of just vanishing.
  useEffect(() => {
    if (open) {
      if (unmountTimer.current) clearTimeout(unmountTimer.current);
      setRendered(true);
    } else if (rendered) {
      unmountTimer.current = setTimeout(() => setRendered(false), DROPDOWN_EXIT_DURATION);
    }
    return () => {
      if (unmountTimer.current) clearTimeout(unmountTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const onLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), DROPDOWN_CLOSE_DELAY);
  };

  const handleItemClick = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
    onItemClick?.();
  };

  // Escape closes; click outside closes (defensive — covers click-to-open
  // on touch/keyboard where there's no mouseleave to fall back on).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`group flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-soft hover:bg-brand-ink/5 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream ${
          highlighted
            ? "text-brand-ink bg-brand-ink/10 shadow-[inset_0_0_0_1px_rgba(31,31,31,0.06)]"
            : "text-brand-ink/80"
        }`}
      >
        {label}
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ease-soft ${open ? "rotate-180" : ""}`}
        />
      </button>

      {rendered && (
        <div
          role="menu"
          className={`absolute left-1/2 top-full z-40 mt-3 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-black/10 bg-white/95 shadow-soft-lg ring-1 ring-black/5 backdrop-blur-sm duration-200 ease-soft ${
            open
              ? "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1"
              : "animate-out fade-out-0 zoom-out-95 slide-out-to-top-1"
          }`}
        >
          {/* Connector notch — visually anchors the panel to its trigger. */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-black/10 bg-white"
          />
          <ul className="relative flex flex-col gap-1 p-2">
            {items.map((item) => {
              const active = isActiveTo(currentPath, item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={resolveLinkTo(item.to)}
                    onClick={handleItemClick}
                    role="menuitem"
                    className={`block rounded-xl px-4 py-3 transition-colors duration-200 ease-soft ${
                      active
                        ? "bg-brand-cream text-brand-ink shadow-[inset_0_0_0_1px_rgba(31,31,31,0.06)]"
                        : "text-brand-ink/80 hover:bg-brand-cream/70 hover:text-brand-ink"
                    }`}
                  >
                    <div className="font-poppins text-[14px] font-semibold leading-tight text-brand-ink">
                      {item.label}
                    </div>
                    {item.desc && (
                      <div className="mt-0.5 text-[12.5px] leading-snug text-brand-ink/65">
                        {item.desc}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileGroup({ item, currentPath, onClose }) {
  const [open, setOpen] = useState(
    item.items?.some((i) => isActiveTo(currentPath, i.to)) || false
  );
  if (!item.items) {
    const active = isActiveTo(currentPath, item.to);
    return (
      <NavLinkBase
        to={item.to}
        isActive={active}
        onClick={onClose}
        className="!rounded-2xl !px-4 !py-3.5 !text-base"
      >
        {item.label}
      </NavLinkBase>
    );
  }
  const active = item.items?.some((i) => isActiveTo(currentPath, i.to));
  return (
    <div className="rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-base font-medium transition duration-300 ease-soft ${
          active
            ? "bg-brand-cream text-brand-ink shadow-[inset_0_0_0_1px_rgba(31,31,31,0.06)]"
            : "text-brand-ink/85 hover:bg-brand-cream"
        }`}
      >
        {item.label}
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ease-soft ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="mb-2 ml-3 mt-1 flex flex-col gap-1 border-l border-brand-ink/10 pl-3">
          {item.items.map((child) => {
            const active = isActiveTo(currentPath, child.to);
            return (
              <li key={child.to}>
                <Link
                  to={resolveLinkTo(child.to)}
                  onClick={onClose}
                  className={`block rounded-xl px-4 py-3 text-[15px] transition-colors duration-200 ease-soft ${
                    active
                      ? "bg-brand-cream font-semibold text-brand-ink"
                      : "text-brand-ink/75 hover:bg-brand-cream"
                  }`}
                >
                  {child.label}
                  {child.desc && (
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-brand-ink/70">
                      {child.desc}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Navbar({ onEnroll }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll-shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body-scroll lock when mobile menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-soft ${
        scrolled
          ? "glass border-b border-black/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" aria-label="Tiny Explorers — home" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2">
          <Logo showTagline={true} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) =>
            item.items ? (
              <Dropdown
                key={item.label}
                label={item.label}
                items={item.items}
                currentPath={pathname}
                onItemClick={() => setOpen(false)}
              />
            ) : (
              <NavLinkBase
                key={item.label}
                to={item.to}
                isActive={isActiveTo(pathname, item.to)}
              >
                {item.label}
              </NavLinkBase>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`mailto:${BRAND.email}`}
            data-testid="nav-contact-email"
            className="text-sm font-medium text-brand-ink/70 transition-colors duration-200 ease-soft hover:text-brand-ink"
          >
            {BRAND.email}
          </a>
          <Button
            variant="accent"
            size="sm"
            onClick={onEnroll}
            testId="nav-enroll-button"
            icon={false}
          >
            Book a Visit
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          data-testid="nav-mobile-toggle"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-brand-ink shadow-soft ring-1 ring-brand-ink/5 transition-colors duration-200 ease-soft lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          data-testid="mobile-menu"
          className="lg:hidden"
        >
          <div className="mx-4 mb-4 max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-soft-lg ring-1 ring-brand-ink/5">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <MobileGroup
                  key={item.label}
                  item={item}
                  currentPath={pathname}
                  onClose={() => setOpen(false)}
                />
              ))}
              <div className="mt-3 border-t border-brand-ink/10 pt-4">
                <Button
                  variant="accent"
                  className="!w-full"
                  onClick={() => {
                    setOpen(false);
                    onEnroll && onEnroll();
                  }}
                  testId="mobile-enroll-button"
                  icon={false}
                >
                  Book a Visit
                </Button>
                <a
                  href={`mailto:${BRAND.email}`}
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-brand-ink/65"
                >
                  or email {BRAND.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
