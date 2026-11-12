// Serves the production build (frontend/build) like a static host would, and
// forwards /api to the local backend. Used by .devcontainer/start-staging.sh.
const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const port = Number(process.env.STAGING_PORT || 4000);
const apiTarget = process.env.STAGING_API_TARGET || `http://127.0.0.1:${process.env.PORT || 8000}`;
const buildDir = path.join(__dirname, "..", "build");

const app = express();
app.use(createProxyMiddleware("/api", { target: apiTarget, changeOrigin: true, logLevel: "warn" }));
app.use(express.static(buildDir, { index: false }));
// Single-page app: every other route gets index.html, as the production host's rewrite does.
app.get("*", (_req, res) => res.sendFile(path.join(buildDir, "index.html")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Staging site on http://localhost:${port} (API -> ${apiTarget})`);
});
