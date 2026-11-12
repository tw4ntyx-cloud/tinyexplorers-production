import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Unsubscribe from "./Unsubscribe";

const render = (url) =>
  renderToStaticMarkup(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Unsubscribe />
      </MemoryRouter>
    </HelmetProvider>
  );

describe("Unsubscribe page", () => {
  it("asks for confirmation instead of unsubscribing on page load", () => {
    const html = render("/unsubscribe?token=abc123abc123abc123abc123");
    expect(html).toContain("Unsubscribe me");
    expect(html).not.toContain("unsubscribe-done");
  });

  it("explains what to do when the link has no token", () => {
    expect(render("/unsubscribe")).toContain("This link is incomplete");
  });
});
