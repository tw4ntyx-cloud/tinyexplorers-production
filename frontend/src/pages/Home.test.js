import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./Home";

describe("Home page", () => {
  it("renders the parent information and policies section", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Calm guidance for the policies that support daily family life.");
  });
});
