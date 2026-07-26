import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import FieldError from "./ui/FieldError";

const CONTACT_METHODS = [
  "Email",
  "Phone",
  "Text message",
  "Open to your suggestion",
];

const initial = {
  parent_name: "",
  email: "",
  child_age: "",
  message: "",
  contact_method: CONTACT_METHODS[0],
};

export default function InquiryModal({ open, onOpenChange }) {
  const [form, setForm] = useState(initial);
  const lastFocusedElementRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.parent_name.trim()) next.parent_name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email address.";
    if (!form.child_age.trim()) next.child_age = "Please enter your child's age.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/inquiry", form);
      toast.success(data.message || "Inquiry submitted!");
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again soon.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const close = (value) => {
    onOpenChange(value);
    if (!value) {
      setTimeout(() => {
        setForm(initial);
        setSuccess(false);
        setErrors({});
      }, 250);
    }
  };

  const inputCls =
    "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/50 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30";

  useEffect(() => {
    if (open) {
      lastFocusedElementRef.current = document.activeElement;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={close} modal>
      <DialogContent
        data-testid="inquiry-modal"
        aria-modal="true"
        aria-labelledby={success ? "inquiry-success-title" : "inquiry-dialog-title"}
        aria-describedby={success ? "inquiry-success-description" : "inquiry-dialog-description"}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastFocusedElementRef.current?.focus?.();
        }}
        className="mx-4 max-w-2xl rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
      >
        {success ? (
          <div className="p-10 text-center" data-testid="inquiry-success">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h3 id="inquiry-success-title" className="mt-6 font-poppins text-3xl font-bold text-brand-ink">
              Thank you for reaching out.
            </h3>
            <p id="inquiry-success-description" className="mt-3 text-brand-ink/70">
              We’ve received your note and will respond within one business day.
            </p>
            <button
              type="button"
              onClick={() => close(false)}
              data-testid="inquiry-success-close"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 p-6 sm:space-y-8 sm:p-8 md:p-10">
            <DialogHeader>
              <DialogTitle id="inquiry-dialog-title" className="font-poppins text-3xl font-bold tracking-tight text-brand-ink">
                General inquiry
              </DialogTitle>
              <DialogDescription id="inquiry-dialog-description" className="max-w-2xl text-base leading-7 text-brand-ink/75">
                A light, low-pressure note to help our team understand your family’s needs.
                We’ll reply in a thoughtful, personal way.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-5" data-testid="inquiry-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Parent name
                  </span>
                  <input
                    type="text"
                    value={form.parent_name}
                    onChange={update("parent_name")}
                    placeholder="Alex Smith"
                    data-testid="inquiry-parent-name"
                    className={inputCls}
                    required
                    aria-invalid={!!errors.parent_name}
                    aria-describedby={errors.parent_name ? "inquiry-parent-name-error" : undefined}
                  />
                  <FieldError id="inquiry-parent-name-error" message={errors.parent_name} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="alex@example.com"
                    data-testid="inquiry-email"
                    className={inputCls}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "inquiry-email-error" : undefined}
                  />
                  <FieldError id="inquiry-email-error" message={errors.email} />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                  Child age
                </span>
                <input
                  type="text"
                  value={form.child_age}
                  onChange={update("child_age")}
                  placeholder="e.g. 2 years, 4 months"
                  data-testid="inquiry-child-age"
                  className={inputCls}
                  required
                  aria-invalid={!!errors.child_age}
                  aria-describedby={errors.child_age ? "inquiry-child-age-error" : undefined}
                />
                <FieldError id="inquiry-child-age-error" message={errors.child_age} />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                  Preferred contact method
                </span>
                <select
                  value={form.contact_method}
                  onChange={update("contact_method")}
                  data-testid="inquiry-contact-method"
                  className={inputCls}
                >
                  {CONTACT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                  Optional message
                </span>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Tell us what you’re curious about or what matters most right now."
                  data-testid="inquiry-message"
                  className={inputCls}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                data-testid="inquiry-submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-4 text-base font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02] hover:shadow-soft-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send inquiry"
                )}
              </button>
              <p className="text-center text-xs text-brand-ink/70">
                We’ll reply within one business day. Your information stays with us.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
