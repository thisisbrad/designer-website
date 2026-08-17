"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { attributionPayload } from "@/lib/analytics/attribution";
import { trackFormError, trackFormStart, trackLead } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-lg text-content transition-colors placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50";

const labelCls =
  "mb-2 block font-mono text-xs tracking-[0.2em] text-muted uppercase";

/* "Not sure yet" leads deliberately, for two reasons. It removes the reason to
   abandon for anyone who genuinely hasn't scoped a budget, and it stops the
   select's silent default from reporting "$5k — $10k" as a stated answer when
   the visitor never touched the field — which quietly poisoned the one piece
   of qualifying data this form collects. */
const budgets = [
  "Not sure yet",
  // Analytics & CRO and SEO both start below $5k, so the old lowest band
  // ("$5k — $10k") left those enquiries with nothing that fitted them.
  "Under $5k",
  "$5k — $15k",
  "$15k — $50k",
  "$50k+",
];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Shared by the homepage section and /contact. Field ids take a prefix so the
 * two can coexist on one page without colliding labels.
 */
export default function ContactForm({
  idPrefix = "contact",
  location = "contact",
  className,
}: {
  idPrefix?: string;
  /** Named placement for analytics, e.g. "home_contact" or "contact_page". */
  location?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const started = useRef(false);

  /* The abandonment denominator. Fires once, on the first real interaction
     with any field, so the gap to generate_lead is the drop-off rate. */
  const onFirstInteraction = () => {
    if (started.current) return;
    started.current = true;
    trackFormStart("enquiry", location);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const data = new FormData(e.currentTarget);
    const budget = String(data.get("budget") ?? "");
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          budget,
          message: data.get("message"),
          // Which ad, campaign or search produced this enquiry — recorded with
          // the lead itself so it survives any GA4 attribution window.
          attribution: attributionPayload(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Try again?");
      }

      setStatus("sent");
      trackLead("enquiry", { location, qualifier: budget });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again, or email me directly.";
      setStatus("error");
      setError(message);
      trackFormError("enquiry", location, message);
    }
  };

  const busy = status === "sending";

  if (status === "sent") {
    return (
      <div
        className={cn(
          "flex flex-col justify-center rounded-2xl border border-accent/25 bg-surface-2 p-8 md:p-10",
          className
        )}
      >
        <p
          role="status"
          className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Message received
        </p>
        <p className="mt-6 font-display text-2xl font-medium tracking-tight text-balance md:text-3xl">
          Thanks — that&apos;s landed with me.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          I read every enquiry personally and reply within 48 hours, usually
          sooner. If it&apos;s urgent, email me directly at{" "}
          <a
            href="mailto:hello@beltowski.studio"
            className="text-content underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
          >
            hello@beltowski.studio
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      onSubmit={onSubmit}
      // React's onFocus bubbles (it maps to focusin), so one handler on the
      // form catches the first touch of any field without wiring each input.
      onFocus={onFirstInteraction}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelCls}>
            Name
          </label>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            required
            disabled={busy}
            autoComplete="name"
            placeholder="Jane Appleseed"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={labelCls}>
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            required
            disabled={busy}
            autoComplete="email"
            placeholder="jane@studio.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-budget`} className={labelCls}>
          Budget
        </label>
        <select
          id={`${idPrefix}-budget`}
          name="budget"
          disabled={busy}
          className={inputCls}
        >
          {budgets.map((budget) => (
            <option key={budget} className="bg-surface">
              {budget}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-message`} className={labelCls}>
          Project details
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          required
          disabled={busy}
          rows={5}
          placeholder="What are we building, and when does it need to exist?"
          className={inputCls}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <MagneticButton type="submit">
          {busy ? "Sending…" : "Send inquiry"}
          <span aria-hidden>↗</span>
        </MagneticButton>
        {status === "error" && (
          <p role="alert" className="text-sm text-content/80">
            {error}{" "}
            {/* The worst possible moment to leave someone without a next step:
                they decided to contact you and the form failed. */}
            <a
              href="mailto:hello@beltowski.studio"
              className="underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
            >
              Email me directly instead.
            </a>
          </p>
        )}
      </div>

      <p className="font-mono text-[10px] tracking-[0.15em] text-muted/70 uppercase">
        Replied to within 48 hours, by me. Used only to reply to you — see the{" "}
        <Link
          href="/privacy"
          className="underline decoration-muted/40 underline-offset-4 transition-colors hover:text-accent"
        >
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
