import type { Metadata } from "next";
import { Clock, Mail, Video } from "lucide-react";
import { BookingForm } from "@/components/forms/BookingForm";
import { Container, RisingWords } from "@/components/ui/Section";
import { booking } from "@/content/booking";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description: `Request a ${booking.durationMinutes}-minute discovery call with the A3RA founders over Google Meet.`,
  alternates: { canonical: "/contact/book" },
};

const details = [
  { icon: Clock, text: `${booking.durationMinutes} minutes, with one or more of the founders.` },
  { icon: Video, text: "On Google Meet — we'll email you the link when we confirm." },
  { icon: Mail, text: "You'll get an email straight away, and a confirmation once we've scheduled it." },
];

export default function BookPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Discovery call</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            <RisingWords text="Let's talk it through." />
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            A short conversation to understand your business and the problem. No preparation needed, and no obligation
            to continue.
          </p>
          <ul className="mt-10 space-y-4">
            {details.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-muted">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-blue" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-3xl border border-line-strong bg-surface p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Pick a time</h2>
          <p className="mt-2 mb-8 text-sm text-muted">Takes about a minute.</p>
          <BookingForm />
        </div>
      </Container>
    </div>
  );
}
