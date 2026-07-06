import React, { useState, useEffect } from "react";
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

const PROGRAM_OPTIONS = [
  "Infant Care (6–18 mo)",
  "Toddler Program (18–36 mo)",
  "Preschool (3–5 yr)",
  "After School Care (5–8 yr)",
  "Not sure yet",
];

const initial = {
  parent_name: "",
  email: "",
  phone: "",
  child_age: "",
  program: PROGRAM_OPTIONS[0],
  start_date: "",
  message: "",
};

export default function EnrollmentModal({ open, onOpenChange, program }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open && program) {
      setForm((current) => ({ ...current, program }));
    }
  }, [open, program]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors((current) => ({ ...current, [k]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.parent_name.trim()) next.parent_name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.child_age.trim()) next.child_age = "Please enter your child's age.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/enrollment", form);
      toast.success(data.message || "Inquiry submitted!");
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not submit. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const close = (v) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setForm(initial);
        setSuccess(false);
        setErrors({});
      }, 250);
    }
  };

  const inputCls =
    "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/50 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        data-testid="enrollment-modal"
        className="mx-4 max-w-2xl rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
      >
        {success ? (
          <div className="p-10 text-center" data-testid="enrollment-success">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h3 className="mt-6 font-poppins text-3xl font-bold text-brand-ink">
              Thank you!
            </h3>
            <p className="mt-3 text-brand-ink/70">
              Your inquiry is in. A member of our enrollment team will be in
              touch within one business day.
            </p>
            <button
              onClick={() => close(false)}
              data-testid="enrollment-success-close"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 p-6 sm:space-y-8 sm:p-8 md:p-10">
            <DialogHeader>
              <DialogTitle className="font-poppins text-3xl font-bold tracking-tight text-brand-ink">
                Start an enrollment inquiry
              </DialogTitle>
              <DialogDescription className="text-brand-ink/70">
                Tell us a little about your family. No obligation — just a warm
                conversation to see if we're the right fit.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" data-testid="enrollment-form">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Parent name *
                  </label>
                  <input
                    type="text"
                    value={form.parent_name}
                    onChange={update("parent_name")}
                    placeholder="Alex Smith"
                    data-testid="enrollment-parent-name"
                    className={inputCls}
                    required
                    aria-invalid={!!errors.parent_name}
                    aria-describedby={errors.parent_name ? "enrollment-parent-name-error" : undefined}
                  />
                  <FieldError id="enrollment-parent-name-error" message={errors.parent_name} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="alex@example.com"
                    data-testid="enrollment-email"
                    className={inputCls}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "enrollment-email-error" : undefined}
                  />
                  <FieldError id="enrollment-email-error" message={errors.email} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 (441) ..."
                    data-testid="enrollment-phone"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Child's age *
                  </label>
                  <input
                    type="text"
                    value={form.child_age}
                    onChange={update("child_age")}
                    placeholder="e.g., 2 years 4 months"
                    data-testid="enrollment-child-age"
                    className={inputCls}
                    required
                    aria-invalid={!!errors.child_age}
                    aria-describedby={errors.child_age ? "enrollment-child-age-error" : undefined}
                  />
                  <FieldError id="enrollment-child-age-error" message={errors.child_age} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Program of interest
                  </label>
                  <select
                    value={form.program}
                    onChange={update("program")}
                    data-testid="enrollment-program"
                    className={inputCls}
                  >
                    {PROGRAM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                    Ideal start date
                  </label>
                  <input
                    type="text"
                    value={form.start_date}
                    onChange={update("start_date")}
                    placeholder="e.g., September 2026"
                    data-testid="enrollment-start-date"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-ink/70">
                  Anything we should know?
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Allergies, sibling at school, hopes for your child..."
                  data-testid="enrollment-message"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="enrollment-submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-4 text-base font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02] hover:shadow-soft-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit inquiry"
                )}
              </button>
              <p className="text-center text-xs text-brand-ink/70">
                We'll reply within one business day. Your information stays with us.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
