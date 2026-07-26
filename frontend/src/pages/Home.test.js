import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

describe("Home page", () => {
  it("renders the parent information and policies section", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const html = renderToStaticMarkup(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    consoleError.mockRestore();

    expect(html).toContain("Calm guidance for the policies that support daily family life.");
  });
});
