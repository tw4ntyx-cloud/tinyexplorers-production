# Policy document generator

Builds the downloadable PDF and Word versions of a parent policy from **the same text the website shows** (`src/data/policies.js`), so downloads cannot drift from the page.

```bash
cd frontend
node scripts/policy-docs/build.mjs privacy-confidentiality-policy        # PDF → public/policies-docs/ and ../docs/policies/
python3 scripts/policy-docs/build_docx.py                               # DOCX → ../docs/policies/docx/ (all listed policies)
```

## Requirements

- **Playwright with Chromium** for the PDF. In cloud sessions it is already at `/opt/node-tools`; elsewhere run `npm i -g playwright && npx playwright install chromium`.
- **python-docx** for the DOCX (`pip install python-docx`).
- **Fonts:** `npm ci` installs them from the `@fontsource/*` dev dependencies (Instrument Serif and JetBrains Mono as in the original documents; Inter replaces Apple's system font, which cannot be redistributed).

## What to edit

| To change | Edit |
|---|---|
| Policy wording | `src/data/policies.js` (also updates the website), then re-run both scripts |
| Version, doc ID, dates, approver, revision history | `metadata.json` |
| Layout | `build.mjs` (PDF) / `build_docx.py` (DOCX) |
| Header logo | `logo.png` (extracted from the original PDFs) |

All twelve policies are listed in `metadata.json`. Only the privacy policy has a generated PDF; the other eleven have `"pdf": false`, which keeps their original approved PDFs (they match the website text word for word) and generates only the editable DOCX copies. DOCX files are deliberately **not** placed in `public/`, so they are not downloadable from the website.
