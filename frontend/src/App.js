import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

import SiteLayout from "@/components/layout/SiteLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Philosophy from "@/pages/Philosophy";
import Wellness from "@/pages/Wellness";
import Adventures from "@/pages/Adventures";
import Parents from "@/pages/Parents";
import Admissions from "@/pages/Admissions";
import PolicyPage from "@/pages/PolicyPage";
import Accessibility from "@/pages/Accessibility";
import NotFound from "@/pages/NotFound";

/**
 * App.js — routing only.
 *
 * Each route renders under <SiteLayout>, which provides the persistent
 * Navbar, Footer, EnrollmentModal, and the `EnrollContext` so pages can
 * open the inquiry modal via `useEnroll()` without prop-drilling.
 *
 * Routes:
 *   /             Home (the existing homepage)
 *   /philosophy   Our Philosophy
 *   /wellness     Wellness & Care
 *   /adventures   Adventures & Field Trips
 *   /parents      Parent Information
 *   /admissions   Admissions
 *   *             Anything unmatched renders NotFound instead of a blank page.
 *
 * Toaster sits outside the layout so toasts persist across route changes.
 * ErrorBoundary wraps the whole router so a render error anywhere in the
 * tree shows a recoverable screen instead of a blank white page.
 */

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/philosophy" element={<Philosophy />} />
              <Route path="/wellness" element={<Wellness />} />
              <Route path="/adventures" element={<Adventures />} />
              <Route path="/parents" element={<Parents />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/policies/:policySlug" element={<PolicyPage />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>

          <Toaster
            position="bottom-center"
            toastOptions={{
              className:
                "rounded-2xl border border-black/5 bg-white text-brand-ink shadow-soft",
            }}
          />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
