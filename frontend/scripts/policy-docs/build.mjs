// Regenerate downloadable policy PDFs from the website's policy text, so the
// download always matches the page. Usage (from frontend/):
//
//   node scripts/policy-docs/build.mjs [slug ...]
//
// Requires Playwright with Chromium (`npm i -g playwright` or NODE_PATH to an
// install; cloud sessions have it under /opt/node-tools). Writes the PDF to
// public/policies-docs/ and ../docs/policies/ (unless metadata says pdf: false),
// plus a JSON copy of the policy for build_docx.py. Only slugs listed in
// metadata.json are processed.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "../..");
const require = createRequire(import.meta.url);

function loadPlaywright() {
  for (const candidate of ["playwright", "/opt/node-tools/node_modules/playwright"]) {
    try {
      return require(candidate);
    } catch (err) {
      // try the next location
    }
  }
  throw new Error("Playwright not found. Install it (npm i -g playwright) or set NODE_PATH.");
}

const { PARENT_POLICIES } = await import(path.join(frontend, "src/data/policies.js"));
const metadata = JSON.parse(fs.readFileSync(path.join(here, "metadata.json"), "utf8"));

const fontFace = (family, file, style = "normal", weight = 400) => {
  const data = fs.readFileSync(path.join(frontend, "node_modules/@fontsource", file)).toString("base64");
  return `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${data}) format("woff2");font-style:${style};font-weight:${weight}}`;
};
const FONTS = [
  fontFace("Instrument Serif", "instrument-serif/files/instrument-serif-latin-400-normal.woff2"),
  fontFace("Instrument Serif", "instrument-serif/files/instrument-serif-latin-400-italic.woff2", "italic"),
  fontFace("JetBrains Mono", "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2"),
  fontFace("Inter", "inter/files/inter-latin-400-normal.woff2"),
  fontFace("Inter", "inter/files/inter-latin-600-normal.woff2", "normal", 600),
].join("\n");
const LOGO = `data:image/png;base64,${fs.readFileSync(path.join(here, "logo.png")).toString("base64")}`;

const COLORS = { cream: "#F7EEE3", ink: "#1F1F1F", muted: "#5b5753", orange: "#E8622A", rule: "#E2DDD6" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// "Label: rest of sentence" paragraphs get a bold label, matching the website's
// definition-style paragraphs (e.g. the Newsletter Sign-Up section).
function paragraph(text) {
  const m = /^([A-Z][A-Za-z /&-]{2,40}): (.+)$/.exec(text);
  return m ? `<p><strong>${esc(m[1])}:</strong> ${esc(m[2])}</p>` : `<p>${esc(text)}</p>`;
}

function block(b) {
  if (b.type === "paragraph") return paragraph(b.text);
  if (b.type === "list") return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  if (b.type === "note") {
    const quote = /^(".*?")\s*(.*)$/s.exec(b.text);
    return `<aside class="note"><div class="label">${esc(b.title || "Note")}</div>${
      quote ? `<p class="quote">${esc(quote[1])}</p><p>${esc(quote[2])}</p>` : `<p>${esc(b.text)}</p>`
    }</aside>`;
  }
  throw new Error(`Unknown block type: ${b.type}`);
}

function bodyHtml(policy, meta) {
  const sections = policy.content.map((s) => ({ ...s, blocks: [...s.blocks] }));
  // The website's first paragraph is the policy's opening statement; the
  // printed layout shows it as a lead paragraph above section 01.
  const lead = sections[0].blocks[0]?.type === "paragraph" ? sections[0].blocks.shift().text : null;
  const sectionHtml = sections
    .map((s, i) => `<section><div class="num">${String(i + 1).padStart(2, "0")}</div><h2>${esc(s.title)}</h2>${s.blocks.map(block).join("")}</section>`)
    .join("");
  const revisions = meta.revisions
    .map((r) => `<tr><td class="mono">${esc(r.version)}</td><td>${esc(r.date)}</td><td>${esc(r.summary)}</td><td>${esc(r.author)}</td></tr>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box}
body{margin:0;font:400 10.5pt/1.75 Inter,system-ui,sans-serif;color:${COLORS.ink};-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{padding:0 0.85in}
.eyebrow,.label,.num,.mono,th{font-family:"JetBrains Mono",monospace}
.eyebrow{color:${COLORS.orange};font-size:7.5pt;letter-spacing:.28em;text-transform:uppercase;margin:18pt 0 6pt}
h1{font:400 28pt/1.1 "Instrument Serif",serif;margin:0 0 8pt;letter-spacing:-.01em}
.summary{color:${COLORS.muted};max-width:4.6in;margin:0;padding-bottom:14pt;border-bottom:1px solid ${COLORS.rule}}
.lead{font-size:11.5pt;line-height:1.7;margin:20pt 0 6pt}
section{margin-top:22pt}
.num{color:${COLORS.orange};font-size:7.5pt;letter-spacing:.1em;break-after:avoid}
h2{font:400 18pt/1.2 "Instrument Serif",serif;margin:8pt 0 10pt;padding-bottom:9pt;border-bottom:1px solid ${COLORS.rule};break-after:avoid}
section > h2 + *{break-before:avoid}
p{margin:0 0 8pt;orphans:3;widows:3}
strong{font-weight:600}
ul{list-style:none;padding:0;margin:4pt 0 10pt}
li{padding-left:16pt;position:relative;margin:3pt 0}
li::before{content:"—";position:absolute;left:0;color:${COLORS.orange}}
.note{border-top:1px solid #EBD9C7;border-bottom:1px solid ${COLORS.rule};padding:10pt 0 6pt;margin:12pt 0;break-inside:avoid}
.note .label{color:${COLORS.orange};font-size:6.5pt;letter-spacing:.28em;text-transform:uppercase;margin-bottom:6pt}
.quote{font:italic 12pt/1.4 "Instrument Serif",serif}
.history{break-before:page;padding-top:4pt}
.history h3{font-family:"JetBrains Mono",monospace;font-weight:400;font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:${COLORS.muted};margin:0 0 8pt}
table{width:100%;border-collapse:collapse;font-size:9pt}
th{font-weight:400;font-size:6.5pt;letter-spacing:.2em;text-transform:uppercase;color:${COLORS.muted};text-align:left;padding:6pt 8pt 6pt 0;border-bottom:1.5px solid ${COLORS.ink}}
td{padding:9pt 8pt 9pt 0;border-bottom:1px solid #EBD9C7;vertical-align:top}
.signoff{display:grid;grid-template-columns:1fr 1fr;gap:24pt;margin-top:40pt}
.signoff > div{border-top:1px solid ${COLORS.ink};padding-top:6pt}
.signoff .label{font-size:6.5pt;letter-spacing:.2em;text-transform:uppercase;color:${COLORS.muted}}
.signoff .who{margin-top:14pt}
.signoff .org{font-family:"JetBrains Mono",monospace;font-size:7pt;color:${COLORS.muted}}
</style></head><body><main>
<div class="eyebrow">Policy document</div>
<h1>${esc(policy.title)}</h1>
<p class="summary">${esc(policy.summary)}</p>
${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
${sectionHtml}
<div class="history"><h3>Revision history</h3>
<table><thead><tr><th>Version</th><th>Date</th><th>Summary</th><th>Author</th></tr></thead><tbody>${revisions}</tbody></table>
<div class="signoff"><div><div class="label">Approved by</div><div class="who">${esc(meta.approvedBy)}</div><div class="org">Tiny Explorers Nursery &amp; Preschool</div></div><div><div class="label">Date</div></div></div>
</div></main></body></html>`;
}

// Header/footer templates are separate documents that do not wait for web
// fonts, so they may only use faces the body has already loaded (400 weights).
function headerHtml(meta) {
  const cell = (label, value, align = "left") =>
    `<div style="text-align:${align}"><div style="font:400 5.5pt 'JetBrains Mono',monospace;letter-spacing:.22em;color:#6f6a64;text-transform:uppercase;white-space:nowrap">${label}</div><div style="font:400 7pt 'JetBrains Mono',monospace;margin-top:5pt;color:#1F1F1F;white-space:nowrap">${esc(value)}</div></div>`;
  return `<style>${FONTS} *{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
<div style="width:100%;margin:-1px 0 0;background:${COLORS.cream};padding:22pt 0.85in 10pt;display:flex;align-items:center;justify-content:space-between;font-size:8pt">
  <div style="display:flex;align-items:center;gap:7pt"><img src="${LOGO}" style="height:30pt"><div>
    <div style="font:400 10.5pt 'Instrument Serif',serif;color:#1F1F1F">Tiny Explorers Nursery &amp; Preschool</div>
    <div style="font:italic 400 7.5pt 'Instrument Serif',serif;color:#6f6a64">Where Learning Blossoms, and Adventures Begin</div></div></div>
  <div style="display:flex;gap:14pt">${cell("Version", meta.version, "right")}${cell("Doc ID", meta.docId, "right")}${cell("Effective", meta.effective, "right")}${cell("Review", meta.review, "right")}${cell("Approved by", meta.approvedBy, "right")}</div>
</div>`;
}

function footerHtml() {
  return `<style>${FONTS} *{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
<div style="width:100%;background:${COLORS.cream};padding:12pt 0.85in 14pt;margin-bottom:-1px;font:400 6.5pt 'JetBrains Mono',monospace;color:#6f6a64;display:flex;justify-content:space-between;border-top:1px solid #EBD9C7">
  <span>tinyexplorersbda.com</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span><span>© 2026 Tiny Explorers Nursery &amp; Preschool</span></div>`;
}

const wanted = process.argv.slice(2);
const slugs = Object.keys(metadata).filter((k) => !k.startsWith("_") && (wanted.length === 0 || wanted.includes(k)));
if (slugs.length === 0) throw new Error("No matching slugs in metadata.json");

const { chromium } = loadPlaywright();
const browser = await chromium.launch(fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {});
try {
  for (const slug of slugs) {
    const policy = PARENT_POLICIES.find((p) => p.slug === slug);
    if (!policy) throw new Error(`Unknown policy slug: ${slug}`);
    const meta = metadata[slug];
    const jsonOut = path.join(here, "out");
    fs.mkdirSync(jsonOut, { recursive: true });
    fs.writeFileSync(path.join(jsonOut, `${slug}.json`), JSON.stringify({ policy, meta }, null, 2));
    if (meta.pdf === false) {
      console.log(`DATA ${slug} (original approved PDF kept; DOCX only)`);
      continue;
    }
    const page = await browser.newPage();
    await page.setContent(bodyHtml(policy, meta), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerHtml(meta),
      footerTemplate: footerHtml(),
      margin: { top: "1.15in", bottom: "0.75in", left: "0", right: "0" },
    });
    await page.close();
    for (const dir of [path.join(frontend, "public/policies-docs"), path.resolve(frontend, "../docs/policies")]) {
      fs.writeFileSync(path.join(dir, policy.downloadFile), pdf);
    }
    console.log(`PDF  ${policy.downloadFile} (${pdf.length} bytes)`);
  }
} finally {
  await browser.close();
}
