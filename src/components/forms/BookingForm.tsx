"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { booking } from "@/content/booking";
import { site } from "@/content/site";
import { appointmentSchema } from "@/lib/validation";
import { cn } from "@/lib/cn";

type FieldErrors = Partial<Record<string, string>>;
type SlotsState = { state: "loading" } | { state: "error" } | { state: "ready"; slots: string[] };
type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-2 block w-full rounded-lg border border-line-strong bg-obsidian px-4 py-3 text-ink placeholder:text-faint transition-colors focus:border-blue focus:outline-none aria-[invalid=true]:border-red-400/70";

const tz = booking.timeZone;
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
const timeLabel = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });

/** The visitor's own time for a slot, if they're not in the booking time zone. */
function localTimeNote(iso: string) {
  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (visitorTz === tz) return null;
  const local = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
  return `That's ${local} where you are.`;
}

async function fetchSlots(): Promise<SlotsState> {
  try {
    const response = await fetch("/api/appointments/slots", { cache: "no-store" });
    const body = (await response.json()) as { ok?: boolean; slots?: string[] };
    return response.ok && body.ok && body.slots ? { state: "ready", slots: body.slots } : { state: "error" };
  } catch {
    return { state: "error" };
  }
}

export function BookingForm() {
  const [slots, setSlots] = useState<SlotsState>({ state: "loading" });
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [bookedLabel, setBookedLabel] = useState<string | null>(null);

  // Bumping this refetches slots (retry, or after a booking changes availability).
  const [slotsVersion, setSlotsVersion] = useState(0);
  const reloadSlots = () => {
    setSlots({ state: "loading" });
    setSlotsVersion((v) => v + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetchSlots().then((next) => {
      if (!cancelled) setSlots(next);
    });
    return () => {
      cancelled = true;
    };
  }, [slotsVersion]);

  const days = useMemo(() => {
    if (slots.state !== "ready") return [];
    const grouped = new Map<string, string[]>();
    for (const iso of slots.slots) {
      const key = dayKey.format(new Date(iso));
      grouped.set(key, [...(grouped.get(key) ?? []), iso]);
    }
    return [...grouped.entries()].map(([key, times]) => ({ key, label: dayLabel.format(new Date(times[0])), times }));
  }, [slots]);

  const activeDay = days.find((d) => d.key === day) ?? days[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const raw = {
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") || undefined,
      topic: data.get("topic"),
      slotStart: slot ?? undefined,
      privacyConsent: data.get("privacyConsent") === "on",
    };

    const result = appointmentSchema.safeParse(raw);
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      setStatus("idle");
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("submitting");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, website: data.get("website") || undefined, source: "booking-page" }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        slotLabel?: string;
        fieldErrors?: FieldErrors;
      };
      if (response.ok && body.ok) {
        setBookedLabel(body.slotLabel ?? null);
        setStatus("success");
        form.reset();
        setSlot(null);
        reloadSlots();
        return;
      }
      if (response.status === 409 || body.fieldErrors?.slotStart) {
        setSlot(null);
        reloadSlots();
      }
      setErrors(body.fieldErrors ?? {});
      setServerError(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setServerError("We couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-blue/40 bg-blue/5 p-6 sm:p-8">
        <CircleCheck aria-hidden className="size-8 text-blue" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight">Request received.</h3>
        <p className="mt-3 leading-relaxed text-muted">
          {bookedLabel ? (
            <>
              We&apos;ve noted <span className="text-ink">{bookedLabel}</span>.{" "}
            </>
          ) : null}
          We&apos;ll confirm by email with a Google Meet link. If that time no longer works for us, we&apos;ll suggest
          alternatives.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 block text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Request another time
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8" aria-label="Book a discovery call">
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="min-w-0">
        <legend className="text-sm font-medium">
          Choose a time <span className="ml-2 font-normal text-faint">Times in {booking.timeZoneLabel} (India)</span>
        </legend>

        {slots.state === "loading" && <p className="mt-4 text-sm text-muted">Loading available times…</p>}
        {slots.state === "error" && (
          <p className="mt-4 text-sm text-red-300">
            We couldn&apos;t load available times.{" "}
            <button type="button" onClick={reloadSlots} className="underline underline-offset-4">
              Try again
            </button>
          </p>
        )}
        {slots.state === "ready" && days.length === 0 && (
          <p className="mt-4 text-sm text-muted">
            No times are open right now. Please{" "}
            <Link href="/contact" className="text-ink underline underline-offset-4">
              send an enquiry
            </Link>{" "}
            instead.
          </p>
        )}

        {activeDay && (
          <>
            <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="radiogroup" aria-label="Day">
              {days.map((d) => {
                const selected = d.key === activeDay.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDay(d.key)}
                    className={cn(
                      "shrink-0 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                      selected ? "border-blue bg-blue/10 text-ink" : "border-line-strong text-muted hover:text-ink",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {activeDay.times.map((iso) => {
                const selected = iso === slot;
                return (
                  <button
                    key={iso}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSlot(iso)}
                    className={cn(
                      "rounded-lg border px-2 py-2.5 text-sm tabular-nums transition-colors",
                      selected ? "border-blue bg-blue text-white" : "border-line-strong text-muted hover:text-ink",
                    )}
                  >
                    {timeLabel.format(new Date(iso))}
                  </button>
                );
              })}
            </div>
            {slot && <p className="mt-3 text-sm text-faint">{localTimeNote(slot)}</p>}
          </>
        )}
        {errors.slotStart && <p className="mt-3 text-sm text-red-300">{errors.slotStart}</p>}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="b-name" className="text-sm font-medium">
            Name
          </label>
          <input id="b-name" name="name" autoComplete="name" aria-invalid={!!errors.name} className={fieldClass} />
          {errors.name && <p className="mt-2 text-sm text-red-300">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="b-email" className="text-sm font-medium">
            Work email
          </label>
          <input
            id="b-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={fieldClass}
          />
          {errors.email && <p className="mt-2 text-sm text-red-300">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="b-company" className="text-sm font-medium">
          Company or website <span className="ml-2 font-normal text-faint">Optional</span>
        </label>
        <input id="b-company" name="company" autoComplete="organization" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="b-topic" className="text-sm font-medium">
          What would you like to discuss?
        </label>
        <textarea
          id="b-topic"
          name="topic"
          rows={3}
          placeholder="One or two sentences is enough."
          aria-invalid={!!errors.topic}
          className={cn(fieldClass, "resize-y")}
        />
        {errors.topic && <p className="mt-2 text-sm text-red-300">{errors.topic}</p>}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="privacyConsent" className="mt-0.5 size-4 shrink-0 accent-blue" />
          <span>
            I agree to A3RA storing these details to arrange this call, as described in the{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-4">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {errors.privacyConsent && <p className="mt-2 text-sm text-red-300">{errors.privacyConsent}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Request this time"}
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
