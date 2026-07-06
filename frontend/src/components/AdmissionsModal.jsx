import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "./ui/Button";
import api from "../lib/api";
import FieldError from "./ui/FieldError";
import { PROGRAMS } from "../data/content";

const inputCls =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/50 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30";

const steps = [
  { label: "Parent Information" },
  { label: "Child Information" },
  { label: "Program Interest" },
  { label: "Schedule & Inquiry" },
];

const initialForm = {
  parent_name: "",
  email: "",
  connect: "A quick note, phone call, or email — whichever feels right.",
  child_name: "",
  child_age: "",
  start_timing: "Soon — I'm exploring options now.",
  child_focus: "A calm, predictable day with warm teachers.",
  program: PROGRAMS[0].programOption,
  interest: "I’d love a welcoming tour first.",
};

export default function AdmissionsModal({ open, onOpenChange }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const close = (value) => {
    onOpenChange(value);
    if (!value) {
      setTimeout(() => {
        setStep(0);
        setForm(initialForm);
        setSuccess(false);
        setErrors({});
      }, 250);
    }
  };

  const onSubmit = async () => {
    const next = {};
    if (!form.parent_name.trim()) next.parent_name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/admissions", form);
      toast.success(data.message || "Admissions request submitted!");
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not submit. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = steps[step]?.label;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        data-testid="admissions-modal"
        className="mx-4 max-w-3xl rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
      >
        {success ? (
          <div className="p-10 text-center" data-testid="admissions-success">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h3 className="mt-6 font-poppins text-3xl font-bold text-brand-ink">
              Thank you!
            </h3>
            <p className="mt-3 text-brand-ink/70">
              Your admissions request is in. A member of our team will be in
              touch within one business day.
            </p>
            <button
              type="button"
              onClick={() => close(false)}
              data-testid="admissions-success-close"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-soft hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        ) : (
        <div className="space-y-6 p-6 sm:space-y-8 sm:p-8 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-ink/70">
                Admissions experience
              </p>
              <DialogHeader>
                <DialogTitle className="font-poppins text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
                  A calm, welcoming way to begin.
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-base leading-7 text-brand-ink/75">
                  Step through a short, warm admissions conversation designed for curious families.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-brand-ink/70 ring-1 ring-black/5">
              {step + 1} of {steps.length}: {stepLabel}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/90 p-6 shadow-soft-sm">
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-brand-cream">
              <div
                className="h-full rounded-full bg-brand-orange transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Your name
                    </span>
                    <input
                      type="text"
                      value={form.parent_name}
                      onChange={update("parent_name")}
                      placeholder="e.g. Olivia Bennett"
                      className={inputCls}
                      aria-invalid={!!errors.parent_name}
                      aria-describedby={errors.parent_name ? "admissions-parent-name-error" : undefined}
                    />
                    <FieldError id="admissions-parent-name-error" message={errors.parent_name} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Email
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="e.g. olivia@example.com"
                      className={inputCls}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "admissions-email-error" : undefined}
                    />
                    <FieldError id="admissions-email-error" message={errors.email} />
                  </label>
                </div>
                <label className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Best way to connect
                  </span>
                  <input
                    type="text"
                    value={form.connect}
                    onChange={update("connect")}
                    className={inputCls}
                  />
                </label>
                <p className="text-sm leading-7 text-brand-ink/70">
                  This is a low-pressure introduction. We’re here to answer your questions and support your family’s pace.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Child’s name
                    </span>
                    <input
                      type="text"
                      value={form.child_name}
                      onChange={update("child_name")}
                      placeholder="e.g. Isla"
                      className={inputCls}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                      Age or stage
                    </span>
                    <input
                      type="text"
                      value={form.child_age}
                      onChange={update("child_age")}
                      placeholder="e.g. 2 years, 4 months"
                      className={inputCls}
                    />
                  </label>
                </div>
                <label className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    When would you like your child to start?
                  </span>
                  <input
                    type="text"
                    value={form.start_timing}
                    onChange={update("start_timing")}
                    className={inputCls}
                  />
                </label>
                <label className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    What matters most for your child?
                  </span>
                  <textarea
                    rows={4}
                    value={form.child_focus}
                    onChange={update("child_focus")}
                    className={inputCls}
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Program interest
                  </p>
                  <p className="mt-3 text-sm leading-7 text-brand-ink/75">
                    Choose the program that feels closest to your child’s rhythm.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PROGRAMS.map((program) => (
                    <button
                      key={program.name}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, program: program.programOption }))}
                      className={`rounded-3xl border p-5 text-left transition-all ${
                        form.program === program.programOption
                          ? "border-brand-orange bg-brand-orange/10 text-brand-ink"
                          : "border-black/10 bg-white text-brand-ink/75 hover:border-brand-ink/30"
                      }`}
                    >
                      <p className="text-sm font-semibold">{program.name}</p>
                      <p className="mt-2 text-sm leading-7 text-brand-ink/75">{program.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm leading-7 text-brand-ink/70">
                  If you’re unsure, we’ll help you choose the right program during the next step.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-3xl bg-brand-cream p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Next step
                  </p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-brand-ink/75">
                    <p>
                      What feels most helpful right now? We can arrange a calm tour, or simply begin a warm inquiry.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        "I’d love a welcoming tour first.",
                        "I’m ready to inquire and learn more.",
                      ].map((option) => (
                        <label
                          key={option}
                          className={`rounded-2xl border p-4 transition-all ${
                            form.interest === option
                              ? "border-brand-orange bg-white text-brand-ink shadow-soft"
                              : "border-black/10 bg-white/90 text-brand-ink/75 hover:border-brand-ink/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="interest"
                            value={option}
                            checked={form.interest === option}
                            onChange={() => setForm((current) => ({ ...current, interest: option }))}
                            className="mr-3 h-4 w-4 accent-brand-orange"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-soft-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-ink/70">
                    Summary
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-brand-cream p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-brand-ink/70">Parent</p>
                      <p className="mt-2 text-sm text-brand-ink/75">{form.parent_name || "–"}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">{form.email || "No email added yet"}</p>
                    </div>
                    <div className="rounded-3xl bg-brand-cream p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-brand-ink/70">Child</p>
                      <p className="mt-2 text-sm text-brand-ink/75">{form.child_name || "–"}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">{form.child_age || "Age or stage"}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-brand-ink/70">
                    <p>{form.program}</p>
                    <p className="mt-2">{form.interest}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                >
                  Back
                </Button>
              )}
              <button
                type="button"
                onClick={() => close(false)}
                className="text-sm font-semibold text-brand-ink/70 hover:text-brand-ink"
              >
                Exit
              </button>
            </div>

            <div className="flex items-center gap-3">
              {step < steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="primary" onClick={onSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit admissions request"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
