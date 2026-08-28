import fs from "fs";
import path from "path";

import { BRAND, FOOTER, TOUR_BOOKING } from "./content";

const EXPECTED_TOUR_BOOKING_URL = "https://calendar.app.google/PKmUZbas6Hyo397WA";

describe("BRAND contact info", () => {
  it("does not expose an unverified placeholder phone number", () => {
    expect(BRAND.phone).toBeUndefined();
    expect(BRAND.phoneHref).toBeUndefined();
  });

  it("uses the canonical contact email", () => {
    expect(BRAND.email).toBe("hello@tinyexplorersbda.com");
  });
});

describe("tour booking configuration", () => {
  it("uses the public Google Calendar booking URL instead of a placeholder", () => {
    expect(TOUR_BOOKING.url).toBe(EXPECTED_TOUR_BOOKING_URL);
    expect(TOUR_BOOKING.url).toMatch(/^https:\/\/calendar\.app\.google\//);
    expect(TOUR_BOOKING.url).not.toMatch(/PASTE|placeholder|javascript:void\(0\)|#$/i);
  });

  it("uses one centralized Google Calendar URL literal in src", () => {
    const srcRoot = path.join(process.cwd(), "src");
    const matches = [];

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (/\.(js|jsx)$/.test(entry.name) && !entry.name.endsWith(".test.js")) {
          const contents = fs.readFileSync(fullPath, "utf8");
          if (contents.includes("calendar.app.google")) {
            matches.push(path.relative(srcRoot, fullPath));
          }
        }
      }
    };

    walk(srcRoot);

    expect(matches).toEqual(["data/content.js"]);
  });

  it("wires the footer Book a Tour link to the centralized URL", () => {
    const connectColumn = FOOTER.columns.find((column) => column.title === "Connect");
    const bookTourLink = connectColumn.links.find((link) => link.label === "Book a Tour");

    expect(bookTourLink.href).toBe(TOUR_BOOKING.url);
    expect(bookTourLink.to).toBeUndefined();
  });

  it("keeps the admissions modal from acting as a tour booking form", () => {
    const modalSource = fs.readFileSync(path.join(process.cwd(), "src/components/AdmissionsModal.jsx"), "utf8");

    expect(modalSource).not.toContain("I’d love a welcoming tour first.");
    expect(modalSource).not.toContain("We can arrange a calm tour");
  });

  it("routes visible tour CTAs through the centralized booking config", () => {
    const ctaFiles = [
      "src/components/CtaSection.jsx",
      "src/components/Gallery.jsx",
      "src/components/Navbar.jsx",
      "src/components/Wellness.jsx",
      "src/pages/Admissions.jsx",
      "src/pages/Parents.jsx",
      "src/pages/Philosophy.jsx",
      "src/pages/Wellness.jsx",
    ];

    for (const file of ctaFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");

      expect(source).toContain("TOUR_BOOKING.url");
      expect(source).not.toMatch(/href=["']#(?:cta|visit)["']/);
      expect(source).not.toMatch(/javascript:void\(0\)/);
      expect(source).not.toMatch(/tinyexplorers\.bm|admin\.tinyexplorers|123-4567|555-0100/i);
    }
  });
});
