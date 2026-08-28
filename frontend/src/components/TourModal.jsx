import React, { useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import Button from "./ui/Button";
import { TOUR_BOOKING } from "../data/content";

const VISIT_DETAILS = [
  { label: "Duration", value: TOUR_BOOKING.duration, Icon: Clock },
  { label: "Location", value: TOUR_BOOKING.location, Icon: MapPin },
  { label: "Availability", value: "Monday-Friday", Icon: Calendar },
];

export default function TourModal({ open, onOpenChange }) {
  const lastFocusedElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      lastFocusedElementRef.current = document.activeElement;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        data-testid="tour-modal"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
        aria-describedby="tour-dialog-description"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastFocusedElementRef.current?.focus?.();
        }}
        className="mx-4 max-w-2xl overflow-hidden rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
      >
        <div className="relative p-6 sm:p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_0%_0%,rgba(251,194,71,0.30)_0%,transparent_62%),radial-gradient(55%_45%_at_100%_100%,rgba(34,197,94,0.16)_0%,transparent_65%)]"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange shadow-soft ring-1 ring-black/5">
              <Sparkles size={13} strokeWidth={2.5} aria-hidden="true" />
              Visit Tiny Explorers
            </div>

            <DialogHeader className="mt-6 space-y-4 text-left">
              <DialogTitle id="tour-dialog-title" className="font-poppins text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-4xl">
                Come see Tiny Explorers for yourself.
              </DialogTitle>
              <DialogDescription id="tour-dialog-description" className="text-base leading-7 text-brand-ink/75">
                We'd love to show you around. Choose a convenient time for a
                30-minute nursery tour, explore our learning environment, learn
                about our programmes and approach, and ask any questions you may have.
              </DialogDescription>
            </DialogHeader>

            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {VISIT_DETAILS.map(({ label, value, Icon }) => (
                <div key={label} className="rounded-2xl bg-white/90 p-4 ring-1 ring-black/5">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink/65">
                    <Icon size={14} strokeWidth={2.4} className="text-brand-orange" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-2 font-poppins text-sm font-semibold leading-snug text-brand-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white/90 p-5 shadow-soft-sm">
              <p className="text-sm leading-6 text-brand-ink/72">
                You'll choose an available appointment and provide your details
                securely through our Google Calendar booking page.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="accent"
                size="lg"
                href={TOUR_BOOKING.url}
                icon="arrow-up-right"
                testId="tour-modal-booking-link"
              >
                Choose a Tour Time
              </Button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-brand-ink/70 transition hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
              >
                Not right now
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}