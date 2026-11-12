const siteFiles = require("../../scripts/site-files");

const PREVIEW = { REACT_APP_WEBSITE_URL: "https://tw4ntyx-cloud.github.io", REACT_APP_ROBOTS: "noindex, nofollow" };
const LAUNCH = { PUBLIC_URL: "/", REACT_APP_WEBSITE_URL: "https://tinyexplorersbda.com", REACT_APP_ROBOTS: "index, follow" };

describe("build-time site files", () => {
  it("keeps today's GitHub Pages preview paths", () => {
    const s = siteFiles.settings(PREVIEW);
    expect(s).toEqual({ origin: "https://tw4ntyx-cloud.github.io", basePath: "/tinyexplorers-production", indexable: false });
    expect(siteFiles.notFoundPage(s)).toContain("var segmentCount = 1;");
    expect(siteFiles.robots(s)).not.toContain("Sitemap:");
  });

  it("switches to the real domain from settings alone", () => {
    const s = siteFiles.settings(LAUNCH);
    expect(s).toEqual({ origin: "https://tinyexplorersbda.com", basePath: "", indexable: true });
    const map = siteFiles.sitemap(s, siteFiles.policySlugs());
    expect(map).toContain("<loc>https://tinyexplorersbda.com/</loc>");
    expect(map).toContain("<loc>https://tinyexplorersbda.com/policies/safe-sleep-policy</loc>");
    expect(map).not.toContain("github.io");
    expect(siteFiles.robots(s)).toContain("Sitemap: https://tinyexplorersbda.com/sitemap.xml");
    expect(siteFiles.notFoundPage(s)).toContain("var segmentCount = 0;");
  });

  it("lists every policy page and no private pages", () => {
    const map = siteFiles.sitemap(siteFiles.settings(LAUNCH), siteFiles.policySlugs());
    expect(siteFiles.policySlugs()).toHaveLength(12);
    expect((map.match(/<loc>/g) || []).length).toBe(7 + 12);
    expect(map).not.toContain("/unsubscribe");
  });
});
