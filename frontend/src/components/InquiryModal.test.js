import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

import InquiryModal from "./InquiryModal";
import api from "../lib/api";

jest.mock("../lib/api", () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

function render() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<InquiryModal open onOpenChange={() => {}} />);
  });
  return () => act(() => root.unmount());
}

const byTestId = (id) => document.querySelector(`[data-testid="${id}"]`);

// React tracks controlled values via the native setter, so set it that way.
function setValue(element, value) {
  const proto = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  act(() => {
    setter.call(element, value);
    element.dispatchEvent(new Event(element.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  });
}

async function submit() {
  await act(async () => {
    byTestId("inquiry-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

function fillRequired() {
  setValue(byTestId("inquiry-parent-name"), "Alex Smith");
  setValue(byTestId("inquiry-email"), "alex@example.com");
  setValue(byTestId("inquiry-child-age"), "2 years");
}

describe("InquiryModal phone contact", () => {
  let unmount;

  beforeEach(() => {
    api.post.mockReset();
    api.post.mockResolvedValue({ data: { message: "ok" } });
    unmount = render();
  });

  afterEach(() => {
    unmount();
    document.body.innerHTML = "";
  });

  it("hides the phone field for email contact and omits phone from the payload", async () => {
    expect(byTestId("inquiry-phone")).toBeNull();
    fillRequired();
    await submit();
    expect(api.post).toHaveBeenCalledTimes(1);
    const [path, payload] = api.post.mock.calls[0];
    expect(path).toBe("/inquiry");
    expect(payload).not.toHaveProperty("phone");
    expect(payload.contact_method).toBe("Email");
  });

  it.each(["Phone", "Text message"])("shows and requires a phone number for %s contact", async (method) => {
    setValue(byTestId("inquiry-contact-method"), method);
    const phone = byTestId("inquiry-phone");
    expect(phone).not.toBeNull();
    expect(phone.getAttribute("type")).toBe("tel");

    fillRequired();
    await submit();
    expect(api.post).not.toHaveBeenCalled();
    expect(phone.getAttribute("aria-invalid")).toBe("true");

    setValue(phone, " +1 441 555 1212 ");
    await submit();
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post.mock.calls[0][1]).toMatchObject({ contact_method: method, phone: "+1 441 555 1212" });
  });

  it("rejects an obviously invalid phone number", async () => {
    setValue(byTestId("inquiry-contact-method"), "Phone");
    fillRequired();
    setValue(byTestId("inquiry-phone"), "call me");
    await submit();
    expect(api.post).not.toHaveBeenCalled();
    expect(byTestId("inquiry-phone").getAttribute("aria-invalid")).toBe("true");
  });
});
