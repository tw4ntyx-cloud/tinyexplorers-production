import React, { useState } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
import { Section, Container, SectionHeader } from "./ui/Section";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import SmartImage from "./ui/SmartImage";
import { IMAGES, TOUR_BOOKING } from "../data/content";

/**
 * Gallery — refined.
 *
 * Previous version layered a heavy `bg-gradient-to-t from-black/55` scrim
 * over every tile and stamped a "Monday · Studio" caption on top. That
 * fights the warm cinematic grading and adds tech-feed energy.
 *
 * New version: clean photo edges, no overlays during rest. A small caption
 * card lifts in on hover from the bottom-left only, and the corner arrow
 * icon is the persistent affordance. Each tile opens a lightbox (Radix
 * Dialog — focus trap, ESC-to-close, and a labelled close button all come
 * from the shared <Dialog> primitive already used across the app).
 *
 * Bento layout preserved (large hero + 5 supporting tiles).
 */

const TILES = [
  { source: IMAGES.gallery.g1, label: "Open studios & light", time: "Monday · Studio", span: "md:col-span-3 md:row-span-2 aspect-[4/5] md:aspect-auto" },
  { source: IMAGES.gallery.g2, label: "Wooden discovery shelves", time: "Materials", span: "md:col-span-2 aspect-square" },
  { source: IMAGES.gallery.g3, label: "Tiny kitchen play", time: "Practical life", span: "aspect-square" },
  { source: IMAGES.gallery.g6, label: "Afternoon hush", time: "Quiet hour", span: "aspect-square" },
  { source: IMAGES.gallery.g4, label: "Side-by-side learning", time: "Reggio circle", span: "md:col-span-2 aspect-square" },
  { source: IMAGES.gallery.g5, label: "Color days", time: "Wednesday · Art", span: "aspect-square" },
];

function Tile({ source, label, time, span, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group image-warm relative overflow-hidden rounded-[1.75rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${span}`}
      aria-label={`View photo: ${label} — ${time}`}
    >
      <SmartImage
        source={source}
        sizes="(min-width: 1024px) 33vw, 90vw"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-soft group-hover:scale-[1.04]"
      />

      {/* Hover-only caption card. Lifts in from the bottom — no scrim at rest. */}
      <figcaption
        className="absolute inset-x-4 bottom-4 translate-y-2 rounded-2xl bg-white/95 px-4 py-2.5 opacity-0 backdrop-blur transition-all duration-300 ease-soft group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink/70">
          {time}
        </div>
        <div className="mt-0.5 font-poppins text-[0.95rem] font-semibold leading-tight text-brand-ink">
          {label}
        </div>
      </figcaption>

      {/* Persistent corner affordance */}
      <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-soft backdrop-blur transition-all duration-300 ease-soft group-hover:bg-brand-ink group-hover:text-white">
        <ArrowUpRight size={16} strokeWidth={2.5} />
      </span>
    </button>
  );
}

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null);
  const activeTile = openIndex !== null ? TILES[openIndex] : null;

  return (
    <Section id="gallery" testId="gallery-section" surface="white" size="lg">
      <Container>
        <SectionHeader
          eyebrow="A peek inside"
          title="Moments from our week."
          lede="An everyday glimpse — gardens, studios, snack tables and the quiet corners in between."
        >
          <a
            href={TOUR_BOOKING.url}
            data-testid="gallery-tour-link"
            className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-brand-cream px-6 py-3 text-sm font-semibold text-brand-ink transition-colors duration-300 ease-soft hover:border-brand-ink/30"
            aria-label="Book a 30-minute campus tour with Google Calendar"
          >
            <Camera size={14} strokeWidth={2.5} />
            Book a campus tour
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-6">
          {TILES.map((t, i) => (
            <Tile key={t.label} {...t} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>
      </Container>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent
          data-testid="gallery-lightbox"
          className="mx-4 max-w-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
        >
          {activeTile && (
            <div className="p-4 sm:p-6">
              <div className="relative overflow-hidden rounded-3xl">
                <SmartImage
                  source={activeTile.source}
                  priority
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <DialogTitle className="mt-4 font-poppins text-xl font-semibold text-brand-ink">
                {activeTile.label}
              </DialogTitle>
              <DialogDescription className="text-sm text-brand-ink/70">
                {activeTile.time}
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
