import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import Button from "./ui/Button";

export default function ContentModal({ open, onOpenChange, title, lede, sections, testId }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        className="mx-4 max-w-2xl rounded-3xl border-0 bg-brand-cream p-0 shadow-soft-lg sm:mx-0"
      >
        <div className="space-y-6 p-6 sm:space-y-8 sm:p-8 md:p-10">
          <DialogHeader>
            <DialogTitle className="font-poppins text-3xl font-bold tracking-tight text-brand-ink">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-base leading-7 text-brand-ink/75">
              {lede}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight text-brand-ink">
                  {section.title}
                </h3>
                {section.text && (
                  <p className="text-[1rem] leading-[1.8] text-brand-ink/70">
                    {section.text}
                  </p>
                )}
                {section.list && (
                  <ul className="space-y-3 pl-4 text-[1rem] leading-[1.8] text-brand-ink/70">
                    {section.list.map((item) => (
                      <li key={item} className="list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
