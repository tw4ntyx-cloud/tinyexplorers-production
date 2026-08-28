import React, { useState, createContext, useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import EnrollmentModal from "../EnrollmentModal";
import AdmissionsModal from "../AdmissionsModal";
import InquiryModal from "../InquiryModal";

/**
 * <SiteLayout> — the consistent page shell.
 *
 * Wraps every routed page with:
 *   - <Navbar>           top navigation (single instance across pages)
 *   - <main><Outlet/>    the routed page content
 *   - <Footer>           premium footer (single instance across pages)
 *   - <AdmissionsModal>  global admissions modal (opened by CTAs like Hero, CtaSection)
 *   - <EnrollmentModal>  lifted from App.js so any page can open it
 *
 * Provides an `EnrollContext` so any descendant can call:
 *   - `openEnroll(program)` — opens enrollment inquiry modal
 *   - `openAdmissions()` — opens admissions modal
 * Without prop-drilling — pages, sections, page-hero CTAs, etc.
 *
 * Also: scrolls to top on route change (cleaner navigation feel), and
 * supports `/parents#faq`-style anchor scrolling on initial navigation
 * to a hash inside a new page.
 */

const EnrollContext = createContext({ open: () => {}, openAdmissions: () => {}, openInquiry: () => {} });

export const useEnroll = () => useContext(EnrollContext).open;
export const useAdmissions = () => useContext(EnrollContext).openAdmissions;
export const useInquiry = () => useContext(EnrollContext).openInquiry;

export default function SiteLayout() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollProgram, setEnrollProgram] = useState("");
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const openEnroll = (program = "") => {
    setEnrollProgram(program);
    setEnrollOpen(true);
  };

  const closeEnroll = (value) => {
    setEnrollOpen(value);
    if (!value) {
      setEnrollProgram("");
    }
  };

  const openAdmissions = () => {
    setAdmissionsOpen(true);
  };

  const closeAdmissions = (value) => {
    setAdmissionsOpen(value);
  };

  const openInquiry = () => {
    setInquiryOpen(true);
  };

  const closeInquiry = (value) => {
    setInquiryOpen(value);
  };

  const { pathname, hash } = useLocation();

  // Scroll-to-top on route change. If there's a hash, jump to that element
  // after a short tick so the page can render first.
  useEffect(() => {
    if (hash) {
      // Wait one frame for the route to mount before scrolling to the anchor.
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return (
    <EnrollContext.Provider value={{ open: openEnroll, openAdmissions, openInquiry }}>
      <div className="App min-h-screen bg-brand-cream text-brand-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-ink focus:shadow-soft"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" tabIndex="-1" className="relative overflow-hidden">
          <div
            key={pathname}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-soft"
          >
            <Outlet />
          </div>
        </main>
        <Footer onEnroll={openEnroll} />
        <AdmissionsModal
          open={admissionsOpen}
          onOpenChange={closeAdmissions}
        />
        <InquiryModal open={inquiryOpen} onOpenChange={closeInquiry} />
        <EnrollmentModal
          open={enrollOpen}
          onOpenChange={closeEnroll}
          program={enrollProgram}
        />
      </div>
    </EnrollContext.Provider>
  );
}
