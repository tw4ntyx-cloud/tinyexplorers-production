// Generates robots.txt, sitemap.xml and 404.html into build/ after `npm run build`
// (wired as the "postbuild" script), from the same settings as the app:
//   REACT_APP_WEBSITE_URL  site origin, e.g. https://tinyexplorersbda.com
//   PUBLIC_URL / homepage  base path, e.g. "/" or "/tinyexplorers-production"
//   REACT_APP_ROBOTS       "noindex, nofollow" (preview/staging) or "index, follow" (launch)
// So the domain cutover is a settings change, not a file edit.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const STATIC_ROUTES = ["/", "/accessibility", "/philosophy", "/wellness", "/adventures", "/parents", "/admissions"];

function readEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

/** Same precedence as Create React App: real environment first, then .env.production, then package.json homepage. */
function settings(env = process.env) {
  const fileEnv = readEnvFile(path.join(ROOT, ".env.production"));
  const pick = (name) => (env[name] !== undefined ? env[name] : fileEnv[name]);
  const homepage = require(path.join(ROOT, "package.json")).homepage || "";
  const publicUrl = pick("PUBLIC_URL") !== undefined ? pick("PUBLIC_URL") : homepage ? new URL(homepage).pathname : "/";
  const basePath = "/" + publicUrl.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+|\/+$/g, "");
  return {
    origin: (pick("REACT_APP_WEBSITE_URL") || "").replace(/\/+$/, ""),
    basePath: basePath === "/" ? "" : basePath,
    indexable: !/noindex/i.test(pick("REACT_APP_ROBOTS") || "noindex"),
  };
}

function policySlugs() {
  const source = fs.readFileSync(path.join(ROOT, "src/data/policies.js"), "utf8");
  return [...source.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]);
}

function sitemap({ origin, basePath }, slugs) {
  const routes = [...STATIC_ROUTES, ...slugs.map((s) => `/policies/${s}`)];
  const urls = routes.map((r) => {
    const loc = `${origin}${basePath}${r === "/" ? "/" : r}`;
    const priority = r === "/" ? "1.0" : r.startsWith("/policies/") ? "0.5" : "0.8";
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated at build time by scripts/site-files.js. Do not edit. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function robots({ origin, basePath, indexable }) {
  // Crawling stays allowed even on noindex builds: a crawler has to fetch a
  // page to see its noindex tag (docs/deployment/PREVIEW_NOINDEX_PLAN.md).
  const lines = ["# Generated at build time by scripts/site-files.js. Do not edit.", "User-agent: *", "Allow: /"];
  if (indexable) lines.push("", `Sitemap: ${origin}${basePath}/sitemap.xml`);
  return lines.join("\n") + "\n";
}

function notFoundPage({ basePath }) {
  // GitHub Pages single-page-app fallback: sends unknown paths to index.html,
  // which restores the route (see the redirect script in public/index.html).
  const segmentCount = basePath ? basePath.split("/").filter(Boolean).length : 0;
  return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Tiny Explorers Nursery & Preschool</title>
        <meta name="robots" content="noindex" />
        <script>
          (function redirectToSpa() {
            var segmentCount = ${segmentCount};
            var loc = window.location;
            var pathname = loc.pathname.split('/').slice(1 + segmentCount).join('/');
            var search = loc.search ? loc.search.slice(1).replace(/&/g, '~and~') : '';
            var hash = loc.hash || '';
            var target = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') +
              loc.pathname.split('/').slice(0, 1 + segmentCount).join('/') + '/?/' + pathname +
              (search ? '&' + search : '') + hash;
            loc.replace(target);
          })();
        </script>
    </head>
    <body></body>
</html>
`;
}

function write(outDir = path.join(ROOT, "build"), env = process.env) {
  const s = settings(env);
  if (!s.origin) throw new Error("REACT_APP_WEBSITE_URL is not set; cannot generate sitemap/robots");
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap(s, policySlugs()));
  fs.writeFileSync(path.join(outDir, "robots.txt"), robots(s));
  fs.writeFileSync(path.join(outDir, "404.html"), notFoundPage(s));
  return s;
}

module.exports = { settings, sitemap, robots, notFoundPage, policySlugs, write };

if (require.main === module) {
  const s = write();
  console.log(`site files: origin=${s.origin} base=${s.basePath || "/"} indexable=${s.indexable}`);
}
