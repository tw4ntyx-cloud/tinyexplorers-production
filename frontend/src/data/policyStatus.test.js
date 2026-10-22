import metadata from "../../scripts/policy-docs/metadata.json";
import { POLICY_STATUS } from "./policyStatus";
import { PARENT_POLICIES } from "./policies";

describe("policy document control", () => {
  it("matches the document generator metadata for every policy", () => {
    for (const policy of PARENT_POLICIES) {
      const meta = metadata[policy.slug];
      const shown = POLICY_STATUS[policy.slug];
      expect(shown).toBeDefined();
      expect(shown).toEqual({
        docId: meta.docId,
        version: meta.version,
        effective: meta.effective,
        status: meta.approvedBy.toLowerCase().startsWith("pending") ? "draft" : "published",
      });
    }
  });

  it("keeps the privacy policy marked as a draft until it is signed off", () => {
    expect(POLICY_STATUS["privacy-confidentiality-policy"].status).toBe("draft");
  });
});
