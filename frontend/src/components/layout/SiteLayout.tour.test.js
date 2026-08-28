import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import SiteLayout from "./SiteLayout";
import Home from "../../pages/Home";
import Admissions from "../../pages/Admissions";

function renderWithRoute(initialPath = "/", element = <Home />) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={element} />
              <Route path="/admissions" element={<Admissions />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      document.body.removeChild(container);
    },
  };
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

function buttonWithText(text) {
  return Array.from(document.querySelectorAll("button")).find((button) => button.textContent.includes(text));
}

describe("Book a Tour CTA behavior", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    window.requestAnimationFrame = (callback) => callback();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens TourModal from the desktop nav and does not open EnrollmentModal", () => {
    const { container, cleanup } = renderWithRoute();

    click(container.querySelector('[data-testid="nav-book-tour-button"]'));

    expect(document.querySelector('[data-testid="tour-modal"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="enrollment-modal"]')).toBeNull();
    expect(document.querySelector('[data-testid="tour-modal-booking-link"]')?.getAttribute("href")).toBe(
      "https://calendar.app.google/PKmUZbas6Hyo397WA"
    );

    cleanup();
  });

  it("opens TourModal from the mobile nav and does not open EnrollmentModal", () => {
    const { container, cleanup } = renderWithRoute();

    click(container.querySelector('[data-testid="nav-mobile-toggle"]'));
    click(container.querySelector('[data-testid="mobile-book-tour-button"]'));

    expect(document.querySelector('[data-testid="tour-modal"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="enrollment-modal"]')).toBeNull();

    cleanup();
  });

  it("opens TourModal from homepage tour CTAs and never opens EnrollmentModal", () => {
    const { container, cleanup } = renderWithRoute();
    const tourSelectors = [
      '[data-testid="cta-primary-button"]',
      '[data-testid="gallery-tour-link"]',
      '[data-testid="wellness-cta"]',
    ];

    for (const selector of tourSelectors) {
      click(container.querySelector(selector));

      expect(document.querySelector('[data-testid="tour-modal"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="enrollment-modal"]')).toBeNull();
      click(buttonWithText("Not right now"));
    }

    cleanup();
  });

  it("still opens EnrollmentModal from genuine enrollment inquiry CTAs", () => {
    const { container, cleanup } = renderWithRoute();

    click(container.querySelector('[data-testid="programs-cta"]'));

    expect(document.querySelector('[data-testid="enrollment-modal"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="tour-modal"]')).toBeNull();

    cleanup();
  });

  it("still opens AdmissionsModal from the existing admissions CTA", () => {
    const { container, cleanup } = renderWithRoute();

    click(container.querySelector('[data-testid="hero-cta-primary"]'));

    expect(document.querySelector('[data-testid="admissions-modal"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="tour-modal"]')).toBeNull();
    expect(document.querySelector('[data-testid="enrollment-modal"]')).toBeNull();

    cleanup();
  });

  it("opens TourModal from admissions page tour CTAs", () => {
    const { container, cleanup } = renderWithRoute("/admissions", <Admissions />);

    click(container.querySelector('[data-testid="admissions-book-tour"]'));

    expect(document.querySelector('[data-testid="tour-modal"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="enrollment-modal"]')).toBeNull();

    cleanup();
  });
});