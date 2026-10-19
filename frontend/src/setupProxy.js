// Development-only (CRA dev server; never part of the production build).
// Forwards /api requests from the dev site to the local FastAPI backend, so
// the browser talks to a single origin: no CORS setup is needed, and it also
// works behind forwarded ports such as GitHub Codespaces. Used when
// REACT_APP_BACKEND_URL is unset (see src/lib/api.js).
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware("/api", {
      target: process.env.DEV_API_PROXY_TARGET || "http://127.0.0.1:8000",
      changeOrigin: true,
      logLevel: "warn",
    })
  );
};
