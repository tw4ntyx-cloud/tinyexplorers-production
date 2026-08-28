import { BRAND } from "./content";

describe("BRAND contact info", () => {
  it("does not expose an unverified placeholder phone number", () => {
    expect(BRAND.phone).toBeUndefined();
    expect(BRAND.phoneHref).toBeUndefined();
  });

  it("uses the canonical contact email", () => {
    expect(BRAND.email).toBe("hello@tinyexplorersbda.com");
  });
});
