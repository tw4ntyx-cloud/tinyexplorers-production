import fs from "fs";
import path from "path";

import { BRAND, TOUR_BOOKING, WELLNESS } from "./content";

// Business facts confirmed or retired by the owner on 2026-10-19
// (docs/OWNER_CONFIRMATIONS.md). These guard against old claims returning.

const ROOT = process.cwd();

function siteSources() {
  const files = [path.join(ROOT, "public/index.html")];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(js|jsx)$/.test(entry.name) && !entry.name.endsWith(".test.js")) files.push(fullPath);
    }
  };
  walk(path.join(ROOT, "src"));
  return files.map((file) => ({ file: path.relative(ROOT, file), text: fs.readFileSync(file, "utf8") }));
}

const RETIRED_CLAIMS = [
  ["second campus", /Paget/],
  ["outdated street address", /Reid Street|HM 11/],
  ["street address shown before booking", /59 Victoria/],
  ["named nurse (owner: do not name)", /Lena Trott/],
  ["fixed Fall 2026 opening", /Fall 2026/],
  ["unsupported ratio comparison", /industry-leading/i],
  ["unconfirmed HEPA filtration", /HEPA/],
  ["unconfirmed pediatric architect", /pediatric architect/i],
  ["unconfirmed 100% certified staff", /"100%"|100% certified/i],
  ["kitchen (families send food)", /Allergen-aware kitchen/],
  ["emergency phone line (no number published)", /Emergency phone/],
  // Round 2 (2026-10-19)
  ["unconfirmed continuously staffed front desk", /Front desk staffed/i],
  ["unconfirmed every-staff checks/certification", /Every staff member background-checked/i],
  ["drill frequency (owner unsure; policy says monthly)", /drills run termly|Quarterly fire/i],
  ["multilingual educators (owner: no)", /Spanish, French, and Portuguese|multilingual educators/i],
  ["no-screens claim (contradicts Media Viewing Policy)", /No screens during|don't use screens/i],
  ["unconfirmed vaccination schedule/exemptions", /Department of Health|exemptions are reviewed/i],
  ["unsupported regulatory comparison", /below Bermuda Ministry minimums/i],
];

describe("owner-confirmed business information", () => {
  const sources = siteSources();

  it.each(RETIRED_CLAIMS)("no longer shows: %s", (_label, pattern) => {
    const hits = sources.filter(({ text }) => pattern.test(text)).map(({ file }) => file);
    expect(hits).toEqual([]);
  });

  it("publishes only the town, with the address shared after booking", () => {
    expect(BRAND.address).toBe("Hamilton, Bermuda");
    expect(TOUR_BOOKING.location).toMatch(/^Hamilton, Bermuda/);
    expect(TOUR_BOOKING.location).toMatch(/booking confirmation/);
  });

  it("describes the nurse by role, not by name", () => {
    expect(WELLNESS.trust_card.name).toBe("Registered Nurse");
  });

  it("states the owner-approved enquiry retention period in the privacy policy", () => {
    expect(sources.some(({ text }) => /deleted six months after they are received/.test(text))).toBe(true);
  });

  it("serves no Word documents from the public website (only the approved PDFs)", () => {
    const publicDocs = fs.readdirSync(path.join(ROOT, "public/policies-docs"));
    expect(publicDocs.filter((name) => /\.docx$/i.test(name))).toEqual([]);
  });

  it("states the confirmed nut-free policy", () => {
    expect(sources.some(({ text }) => /fully nut-free/.test(text))).toBe(true);
  });
});
