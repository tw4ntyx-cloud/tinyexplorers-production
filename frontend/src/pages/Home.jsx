import React from "react";
import PageMeta from "../components/PageMeta";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Environment from "../components/Environment";
import Wellness from "../components/Wellness";
import Programs from "../components/Programs";
import DayRhythm from "../components/DayRhythm";
import Testimonial from "../components/Testimonial";
import CtaSection from "../components/CtaSection";
import Gallery from "../components/Gallery";
import ParentPoliciesSection from "../components/page/ParentPoliciesSection";
import { useEnroll } from "../components/layout/SiteLayout";

/**
 * Home — the existing homepage, untouched in composition.
 *
 * Extracted from App.js so it slots cleanly alongside the new routed pages.
 * The page sections themselves (Hero, Features, etc.) are unchanged.
 * Hero and CtaSection use useAdmissions() internally.
 * Other sections use `useEnroll()` for program-specific inquiries.
 */
export default function Home() {
  const openEnroll = useEnroll();
  return (
    <>
      <PageMeta />
      <Hero />
      <ParentPoliciesSection />
      <Features />
      <Environment />
      <Wellness onEnroll={openEnroll} />
      <Programs onEnroll={openEnroll} />
      <DayRhythm />
      <Testimonial />
      <CtaSection />
      <Gallery />
    </>
  );
}
