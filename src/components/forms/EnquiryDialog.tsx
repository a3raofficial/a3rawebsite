"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { ProjectEnquiryForm } from "@/components/forms/ProjectEnquiryForm";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type EnquiryDialogProps = {
  label: string;
  /** Recorded with the lead so we know where enquiries come from. */
  source: string;
  className?: string;
};

/**
 * A button that opens the project enquiry form in a modal dialog. Uses the
 * native <dialog> element: focus is trapped and Escape closes it for free.
 */
export function EnquiryDialog({ label, source, className }: EnquiryDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // Lock page scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  // Leaving the page (React Activity hides it) must not leave the dialog open.
  useEffect(() => {
    const el = dialog.current;
    return () => el?.close();
  }, []);

  const show = () => {
    dialog.current?.showModal();
    setOpen(true);
  };
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" onClick={show} className={cn(buttonClasses("primary", "lg"), className)} aria-haspopup="dialog">
        {label}
        <ArrowUpRight aria-hidden className="size-4" />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${source}-dialog-title`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself, outside the panel) closes it.
          if (e.target === e.currentTarget) close();
        }}
        className="enquiry-dialog m-auto max-h-[92svh] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-3xl border border-line-strong bg-surface p-0 text-ink shadow-2xl"
      >
        <div className="relative p-6 sm:p-10">
          <button
            type="button"
            onClick={close}
            aria-label="Close enquiry form"
            className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
          <h2 id={`${source}-dialog-title`} className="pr-10 text-2xl font-semibold tracking-tight sm:text-3xl">
            Discuss your project
          </h2>
          <p className="mt-2 mb-8 text-sm text-muted">Takes about two minutes. Only your name, email and focus are required.</p>
          {open && <ProjectEnquiryForm source={source} />}
        </div>
      </dialog>
    </>
  );
}
