"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { booking } from "@/content/booking";
import { site } from "@/content/site";
import { enquirySchema, serviceInterests, timelines } from "@/lib/validation";
import { cn } from "@/lib/cn";

type FieldErrors = Partial<Record<string, string>>;

const fieldClass =
  "mt-2 block w-full rounded-lg border border-line-strong bg-obsidian px-4 py-3 text-ink placeholder:text-faint transition-colors focus:border-blue focus:outline-none aria-[invalid=true]:border-red-400/70";

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-2 font-normal text-faint">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Project enquiry form. Validates in the browser with the shared Zod schema,
 * then posts to /api/leads, which validates again, stores the enquiry and
 * emails both sides. Success is only shown once the server has saved it.
 */
export function ProjectEnquiryForm({ source = "contact-page" }: { source?: string }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return; // no duplicate submissions while one is in flight
    const form = event.currentTarget;
    const data = new FormData(form);
    const raw = {
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") || undefined,
      serviceInterest: data.get("serviceInterest") || undefined,
      problemDescription: data.get("problemDescription") || undefined,
      timeline: data.get("timeline") || undefined,
      privacyConsent: data.get("privacyConsent") === "on",
    };

    const result = enquirySchema.safeParse(raw);
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      showErrors(form, next);
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("submitting");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, website: data.get("website") || undefined, source }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (response.ok && body.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (body.fieldErrors) showErrors(form, body.fieldErrors);
      setServerError(body.error ?? "Something went wrong and your enquiry was not sent. Please try again.");
      setStatus("error");
    } catch {
      setServerError("We couldn't reach the server, so your enquiry was not sent. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function showErrors(form: HTMLFormElement, next: FieldErrors) {
    setErrors(next);
    setStatus("idle");
    const first = Object.keys(next)[0];
    if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-blue/40 bg-blue/5 p-6 sm:p-8">
        <CircleCheck aria-hidden className="size-8 text-blue" />
        <p className="mt-5 text-lg leading-relaxed text-ink">
          Thanks for reaching out. Your enquiry has been received. We&apos;ll review the details and follow up using the
          contact information you provided.
        </p>
        <Link href={site.bookingUrl} className={buttonClasses("secondary", "md", "mt-6")}>
          Book a {booking.durationMinutes}-minute call
        </Link>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 block text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const describedBy = (name: string) => (errors[name] ? `${id(name)}-error` : undefined);

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6" aria-label="Project enquiry">
      {/* Honeypot: invisible to people and screen readers; bots often fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id("name")} label="Name" error={errors.name}>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={fieldClass}
          />
        </Field>
        <Field id={id("email")} label="Work email" error={errors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={fieldClass}
          />
        </Field>
      </div>

      <Field id={id("company")} label="Company name" optional error={errors.company}>
        <input id={id("company")} name="company" autoComplete="organization" className={fieldClass} />
      </Field>

      <Field id={id("serviceInterest")} label="What would you like to improve?" error={errors.serviceInterest}>
        <select
          id={id("serviceInterest")}
          name="serviceInterest"
          required
          defaultValue=""
          aria-invalid={!!errors.serviceInterest}
          aria-describedby={describedBy("serviceInterest")}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose one
          </option>
          {serviceInterests.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>

      <Field
        id={id("problemDescription")}
        label="Tell us a little about the challenge"
        optional
        error={errors.problemDescription}
      >
        <textarea
          id={id("problemDescription")}
          name="problemDescription"
          rows={4}
          placeholder="A few sentences is plenty. You don't need a technical specification."
          aria-invalid={!!errors.problemDescription}
          aria-describedby={describedBy("problemDescription")}
          className={cn(fieldClass, "resize-y")}
        />
      </Field>

      <Field id={id("timeline")} label="Expected timeline" optional>
        <select id={id("timeline")} name="timeline" defaultValue="" className={fieldClass}>
          <option value="">Prefer not to say</option>
          {timelines.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="privacyConsent"
            aria-invalid={!!errors.privacyConsent}
            aria-describedby={describedBy("privacyConsent")}
            className="mt-0.5 size-4 shrink-0 accent-blue"
          />
          <span>
            I agree to A3RA storing these details to respond to my enquiry, as described in the{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-4">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {errors.privacyConsent && (
          <p id={`${id("privacyConsent")}-error`} className="mt-2 text-sm text-red-300">
            {errors.privacyConsent}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send project enquiry"}
        {status !== "submitting" && <ArrowRight aria-hidden className="size-4" />}
      </Button>

      <div aria-live="polite">
        {status === "error" && serverError && (
          <div className="flex gap-3 rounded-xl border border-red-400/40 bg-red-400/5 p-4 text-sm">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-red-300" />
            <p className="text-muted">
              <span className="text-ink">{serverError}</span>
              {site.contactEmail && (
                <>
                  {" "}
                  You can also email{" "}
                  <a href={`mailto:${site.contactEmail}`} className="text-ink underline underline-offset-4">
                    {site.contactEmail}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
